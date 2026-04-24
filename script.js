/*-------------------USANDO NODE PURO---------------------------

import { createServer } from 'node:http'

const server = createServer((request, response) =>{
    
    response.write("oi")
    return response.end();//Encerrando a requisição
})

//Indica a porta do servidor
server.listen(3333)
*/

//-------------------USANDO EXPRESS---------------------------

import express from "express"
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken" 
import 'dotenv/config'
import User from './models/User.js';


const app = express();

app.use(express.json())//permite ler arquivos .json
app.use(express.urlencoded({ extended: true }));//permite ler dados de formulários html

const port = 3000 
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS
//Pegando o banco de dados
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.aze2pmq.mongodb.net/?appName=Cluster0`)
.then(()=>{ //mesma coisa que o try except só que para código ASSÍNCRONO
app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
}).catch((err) => console.log(err))//err significa o erro

//Criando rostas(ending points)
app.get("/", (req, res) =>{
    res.json({msg: "Bem-vindo à API"})
})

app.post("/registrar", async (req, res) =>{
    const {nome, email, senha, confirmsenha} = req.body

    //Validação dos dados
    if(!nome || !email || !senha){
        return res.status(422).json({mgs: "Coloque os dados obrigatórios"}) 
    }
    if(senha !== confirmsenha){
        return res.status(422).json({mgs: "As senhas não são iguais"}) 
    }
    

    //Checar se o usuário existe
    const checkuser = await User.findOne({email: email})//Semelhante à uma WHERE. Procura na lista de usuários se tem um email correspondente ao email antes colocado

    if (checkuser){
        return res.status(422).json({msg: 'Por favor, utilize outro email'}) //Se já existir um usuário com este email quando for criar um usuário, vai retornar esta mensagem
    }

    //Criando uma senha com digitos a mais na senha que o usuário digitou (nesse caso 12 dígitos aleatórios a mais)
    const salt = await bcrypt.genSalt(12)
    const senhahash = await bcrypt.hash(senha, salt)// Gerando a senha criptografada, passando a senha e o salt para o bcrypt. O resultado é a senha criptografada, que é o que vai ser salvo no banco de dados

    //Criar usuário
    const user = new User({// Criando um novo usuário, passando os dados para o banco de dados
        nome,
        email, 
        senha: senhahash //Quando o nome da variável é igual ao tipo, não precisa colocar o nome do campo, mas como a senha tem um nome diferente, tem que colocar o tipo
    })

    try{
        await user.save()//Vai salvar o usuário no banco de dados
        res.status(201).json({msg:'Usuário salvo com sucesso'})
    }
    catch(er){
        res.status(500).json({msg: 'Erro no servidor'})
    }

     
    
})

app.post("/login", async (req, res) =>{
    const {email, senha} = req.body

    if(!email || !senha){
        return res.status(422).json({mgs: "Coloque os dados obrigatórios"}) 
    }

    //Checar se o usuário existe
    const user = await User.findOne({email: email})

    if (!user){
        return res.status(422).json({msg: 'Usuário não encontrado'}) 
    }

    //Checar se a senha é correta
    const checksenha = await bcrypt.compare(senha, user.senha)

    if (!checksenha){
        return res.status(422).json({msg: 'Senha inválida'}) 
    }

    try{
        const secret = process.env.SECRET //Pegando a chave secreta do arquivo .env para gerar o token, que é o que vai ser retornado para o usuário
        const token = jsonwebtoken.sign( //Gerando o token, passando o id do usuário e a chave secreta para o jsonwebtoken. O resultado é o token, que é o que vai ser retornado para o usuário
            {
                id: user._id
            },
            secret,
        )
        res.status(200).json({msg:'Autenticação realizada com sucesso', token})//Retornando o token e os dados do usuário para o cliente
    }
    catch(er){
        res.status(500).json({msg: 'Erro no servidor'})
    }
})

function checkToken(req, res, next){
        const authHeader = req.headers['authorization'] //Pegando o token do header da requisição
        const token = authHeader && authHeader.split(' ')[1] //Pegando o token, que é a segunda parte do header (o header tem o formato "Bearer token")

        if (!token){
            return res.status(401).json({msg: 'Acesso negado'}) //Se não tiver token, retorna acesso negado
        }
        try{//Se tiver token, vai tentar verificar o token
            const secret = process.env.SECRET //Pegando a chave secreta do arquivo .env para verificar o token
            jsonwebtoken.verify(token, secret) //Verificando o token, passando o token e a chave secreta para o jsonwebtoken. Se o token for válido, a função retorna true, caso contrário, retorna false
            next() //Se o token for válido, continua para a próxima função (que é a função que retorna os dados do usuário)
        }
        catch(er){
            res.status(400).json({msg: 'Token inválido'}) //Se o token for inválido, retorna token inválido
        }
}

//Criando uma rota protegida, ou seja, que só pode ser acessada por usuários autenticados
app.get("/user/:id", checkToken, async (req, res) =>{
    const id = req.params.id //Pegando o id do usuário que está tentando acessar a rota protegida
    
    //Checar se o usuário existe
    const user = await User.findById(id, '-senha')//Procurando o usuário pelo id, mas excluindo a senha

    if (!user){
        return res.status(404).json({msg: 'Usuário não encontrado'}) 
    }
    else{
        res.status(200).json({user})//Retornando os dados do usuário para o cliente, sem a senha
    }
})
app.use(express.static("parte_html"));






