import mongoose from "mongoose";

const User = mongoose.model('User',{ //Criando o banco de dados, priemiro paramentro é o nome e depois são os dados e os tipos
    nome: String,
    email: String,
    senha: String
} 
)

//module.exports = User. Se não for ES MODULES

export default mongoose.model('User');