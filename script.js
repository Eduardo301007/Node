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
.then(()=>{
app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
}).catch((err) => console.log(err))//err significa o erro

//Criando rostas(ending points)
app.get("/", (req, res) =>{
    res.json({users});
})

app.post("/login", (req, res) =>{
    const {nome, email, senha, confirmsenha} = req.body

    //Validação dos dados
    if(!nome || !email || !senha){
        return res.status(422).json({mgs: "Coloque os dados obrigatórios"}) 
    }
    else if(senha !== confirmsenha){
        return res.status(422).json({mgs: "As senhas não são iguais"}) 
    }
    else{
        return res.status(422).json({mgs: "Tudo certin"}) 
    }

    //Checar se o usuário existe
    const checkuser = User.findOne({email: email})//Semelhante à uma WHERE
    
    
})







