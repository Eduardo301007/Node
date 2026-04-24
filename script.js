import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import 'dotenv/config';
import User from './models/User.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.aze2pmq.mongodb.net/?appName=Cluster0`)
  .then(() => {
    app.listen(3000, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));

function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Acesso negado' });
  }

  try {
    const secret = process.env.SECRET;
    jsonwebtoken.verify(token, secret);
    next();
  } catch (er) {
    res.status(400).json({ msg: 'Token inválido' });
  }
}

app.get("/", (req, res) => {
  res.json({ msg: "Bem-vindo à API" });
});

app.post("/registrar", async (req, res) => {
  const { nome, email, senha, confirmsenha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(422).json({ mgs: "Coloque os dados obrigatórios" });
  }
  if (senha !== confirmsenha) {
    return res.status(422).json({ mgs: "As senhas não são iguais" });
  }

  const checkuser = await User.findOne({ email: email });

  if (checkuser) {
    return res.status(422).json({ msg: 'Por favor, utilize outro email' });
  }

  const salt = await bcrypt.genSalt(12);
  const senhahash = await bcrypt.hash(senha, salt);

  const user = new User({
    nome,
    email,
    senha: senhahash
  });

  try {
    await user.save();
    res.status(201).json({ msg: 'Usuário salvo com sucesso' });
  } catch (er) {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(422).json({ mgs: "Coloque os dados obrigatórios" });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).json({ msg: 'Usuário não encontrado' });
  }

  const checksenha = await bcrypt.compare(senha, user.senha);

  if (!checksenha) {
    return res.status(422).json({ msg: 'Senha inválida' });
  }

  try {
    const secret = process.env.SECRET;
    const token = jsonwebtoken.sign(
      {
        id: user._id
      },
      secret,
    );
    res.status(200).json({ msg: 'Autenticação realizada com sucesso', token });
  } catch (er) {
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, '-senha');

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ msg: 'Erro no servidor ou ID inválido' });
  }
});

app.use(express.static("parte_html"));