const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

const MONGO_URI = 'mongodb+srv://giovannaimamuraportella_db_user:RNnnBC8AYaoNqpS4@cluster0.yszxz7h.mongodb.net/?appName=Cluster0';
const DB_NAME = 'LAB10';
let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    console.log('✅ Conectado ao MongoDB com sucesso!');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  });

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// =============================================
// ROTAS PRINCIPAIS
// =============================================
app.get('/', (req, res) => res.redirect('/projects'));
app.get('/projects', (req, res) => res.render('projects'));

// =============================================
// USUÁRIOS
// =============================================

// Mostra o formulário de cadastro
app.get('/usuarios/cadastro', (req, res) => {
  res.render('usuarios/cadastro', { erro: null, sucesso: null });
});

// CREATE - Cadastra novo usuário no banco
app.post('/usuarios/cadastro', async (req, res) => {
  const { nome, login, senha } = req.body;
  await db.collection('usuarios').insertOne({ nome, login, senha });
  res.render('usuarios/cadastro', { erro: null, sucesso: 'Cadastrado com sucesso!' });
});

// Mostra o formulário de login
app.get('/usuarios/login', (req, res) => {
  res.render('usuarios/login', { erro: null });
});

// READ - Busca usuário no banco para autenticar
app.post('/usuarios/login', async (req, res) => {
  const { login, senha } = req.body;
  const usuario = await db.collection('usuarios').findOne({ login, senha });
  if (!usuario) return res.render('usuarios/login', { erro: 'Login incorreto!' });
  res.redirect('/carros');
});

// =============================================
// CARROS
// =============================================

// READ - Busca todos os carros e mostra na listagem
app.get('/carros', async (req, res) => {
  const carros = await db.collection('carros').find({}).toArray();
  res.render('carros/listagem', { carros });
});

// READ - Busca todos os carros e mostra na gerência
app.get('/carros/gerencia', async (req, res) => {
  const carros = await db.collection('carros').find({}).toArray();
  res.render('carros/gerencia', { carros });
});

// CREATE - Cadastra novo carro no banco
app.post('/carros/cadastrar', async (req, res) => {
  const { marca, modelo, ano, qtde_disponivel } = req.body;
  await db.collection('carros').insertOne({ marca, modelo, ano: parseInt(ano), qtde_disponivel: parseInt(qtde_disponivel) });
  res.redirect('/carros/gerencia');
});

// READ - Busca um carro pelo id para preencher o formulário de edição
app.get('/carros/editar/:id', async (req, res) => {
  const carro = await db.collection('carros').findOne({ _id: new ObjectId(req.params.id) });
  res.render('carros/editar', { carro });
});

// UPDATE - Atualiza os dados do carro no banco
app.post('/carros/atualizar/:id', async (req, res) => {
  const { marca, modelo, ano, qtde_disponivel } = req.body;
  await db.collection('carros').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { marca, modelo, ano: parseInt(ano), qtde_disponivel: parseInt(qtde_disponivel) } }
  );
  res.redirect('/carros/gerencia');
});

// DELETE - Remove o carro do banco
app.post('/carros/remover/:id', async (req, res) => {
  await db.collection('carros').deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect('/carros/gerencia');
});

// UPDATE - Vende o carro, decrementa a quantidade no banco
app.post('/carros/vender/:id', async (req, res) => {
  const carro = await db.collection('carros').findOne({ _id: new ObjectId(req.params.id) });
  if (carro.qtde_disponivel <= 0) return res.redirect('/carros/gerencia');
  await db.collection('carros').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $inc: { qtde_disponivel: -1 } }
  );
  res.redirect('/carros/gerencia');
});

app.listen(80, () => console.log('🚀 Servidor rodando na porta 80'));