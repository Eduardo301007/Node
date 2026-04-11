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
app.use(express.static("parte_html"));

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
    res.json({nome, email, senha, confirmsenha});
})

app.post("/login", async (req, res) =>{
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
    const senhahash = await bcrypt.hash(senha, salt)

    //Criar usuário
    const user = new User({
        nome,
        email, 
        senha: senhahash,
    })

    try{
        await user.save()//Vai salvar o usuário no banco de dados
        res.status(201).json({msg:'Usuário salvo com sucesso'})
    }
    catch(er){
        res.status(500).json({msg: 'Erro no servidor'})
    }

     
    
})







