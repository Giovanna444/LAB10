# 🚗 Lab 10 - Sistema de Venda de Carros
## PASSO A PASSO PARA CRIAR DO ZERO NA PROVA

---

## 1️⃣ ABRIR O CMD COMO ADMINISTRADOR
- Aperta a tecla **Windows**
- Digita **cmd**
- Botão direito → **"Executar como administrador"**

---

## 2️⃣ CRIAR A PASTA E ENTRAR NELA
```bash
cd "C:\Users\SEU_USUARIO\Desktop\lab10"
```
**OU** abre a pasta no Explorer → clica na barra de endereço → digita **cmd** → Enter

---

## 3️⃣ INICIAR O PROJETO E INSTALAR DEPENDÊNCIAS
```bash
npm init -y
npm install express mongodb ejs
```

---

## 4️⃣ CRIAR AS PASTAS
```bash
mkdir views
mkdir views\usuarios
mkdir views\carros
mkdir public
mkdir public\css
```

---

## 5️⃣ CRIAR O server.js
Cria o arquivo `server.js` com o seguinte código:

```js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

const MONGO_URI = 'mongodb+srv://anasalles:Rxj1hplHF0vO7mOy@cluster0.pat4zgo.mongodb.net/lab10?retryWrites=true&w=majority';
const DB_NAME = 'lab10';

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
```

---

## 6️⃣ CRIAR AS PÁGINAS EJS

### views\projects.ejs
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Projects</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/projects">Projects</a>
    <a href="/carros">Carros</a>
    <a href="/usuarios/login">Login</a>
  </nav>
  <h1>Projects</h1>
  <table>
    <thead>
      <tr><th>Projeto</th><th>Link</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Carros</td>
        <td><a href="/carros">Acessar</a></td>
      </tr>
    </tbody>
  </table>
</body>
</html>
```

### views\usuarios\cadastro.ejs
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Cadastro</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/projects">Projects</a>
    <a href="/carros">Carros</a>
    <a href="/usuarios/login">Login</a>
  </nav>
  <h1>Cadastro de Usuário</h1>
  <% if (erro) { %><p style="color:red"><%= erro %></p><% } %>
  <% if (sucesso) { %><p style="color:green"><%= sucesso %></p><% } %>
  <form action="/usuarios/cadastro" method="POST">
    <label>Nome:</label>
    <input type="text" name="nome" required><br>
    <label>Login:</label>
    <input type="text" name="login" required><br>
    <label>Senha:</label>
    <input type="password" name="senha" required><br>
    <button type="submit">Cadastrar</button>
  </form>
  <a href="/usuarios/login">Já tenho conta</a>
</body>
</html>
```

### views\usuarios\login.ejs
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Login</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/projects">Projects</a>
    <a href="/carros">Carros</a>
    <a href="/usuarios/cadastro">Cadastro</a>
  </nav>
  <h1>Login</h1>
  <% if (erro) { %><p style="color:red"><%= erro %></p><% } %>
  <form action="/usuarios/login" method="POST">
    <label>Login:</label>
    <input type="text" name="login" required><br>
    <label>Senha:</label>
    <input type="password" name="senha" required><br>
    <button type="submit">Entrar</button>
  </form>
  <a href="/usuarios/cadastro">Criar conta</a>
</body>
</html>
```

### views\carros\listagem.ejs
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Carros Disponíveis</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/projects">Projects</a>
    <a href="/carros">Listagem</a>
    <a href="/carros/gerencia">Gerência</a>
    <a href="/usuarios/login">Login</a>
  </nav>
  <h1>Carros Disponíveis</h1>
  <% carros.forEach(carro => { %>
    <div>
      <h2><%= carro.marca %> <%= carro.modelo %></h2>
      <p>Ano: <%= carro.ano %></p>
      <% if (carro.qtde_disponivel > 0) { %>
        <p style="color:green">Disponível: <%= carro.qtde_disponivel %></p>
      <% } else { %>
        <p style="color:red">ESGOTADO</p>
      <% } %>
    </div>
  <% }) %>
</body>
</html>
```

### views\carros\gerencia.ejs
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Gerência de Carros</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/projects">Projects</a>
    <a href="/carros">Listagem</a>
    <a href="/carros/gerencia">Gerência</a>
    <a href="/usuarios/login">Login</a>
  </nav>
  <h1>Gerência de Carros</h1>
  <h2>Cadastrar Novo Carro</h2>
  <form action="/carros/cadastrar" method="POST">
    <label>Marca:</label>
    <input type="text" name="marca" required><br>
    <label>Modelo:</label>
    <input type="text" name="modelo" required><br>
    <label>Ano:</label>
    <input type="number" name="ano" required><br>
    <label>Quantidade:</label>
    <input type="number" name="qtde_disponivel" required><br>
    <button type="submit">Cadastrar</button>
  </form>
  <h2>Carros Cadastrados</h2>
  <table>
    <thead>
      <tr>
        <th>Marca</th><th>Modelo</th><th>Ano</th>
        <th>Qtde</th><th>Status</th><th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <% carros.forEach(carro => { %>
        <tr>
          <td><%= carro.marca %></td>
          <td><%= carro.modelo %></td>
          <td><%= carro.ano %></td>
          <td><%= carro.qtde_disponivel %></td>
          <td>
            <% if (carro.qtde_disponivel > 0) { %>
              <span style="color:green">Disponível</span>
            <% } else { %>
              <span style="color:red">ESGOTADO</span>
            <% } %>
          </td>
          <td>
            <form action="/carros/vender/<%= carro._id %>" method="POST" style="display:inline">
              <button type="submit">Vender</button>
            </form>
            <a href="/carros/editar/<%= carro._id %>">Editar</a>
            <form action="/carros/remover/<%= carro._id %>" method="POST" style="display:inline">
              <button type="submit">Remover</button>
            </form>
          </td>
        </tr>
      <% }) %>
    </tbody>
  </table>
</body>
</html>
```

### views\carros\editar.ejs
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Editar Carro</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav>
    <a href="/projects">Projects</a>
    <a href="/carros">Listagem</a>
    <a href="/carros/gerencia">Gerência</a>
    <a href="/usuarios/login">Login</a>
  </nav>
  <h1>Editar Carro</h1>
  <form action="/carros/atualizar/<%= carro._id %>" method="POST">
    <label>Marca:</label>
    <input type="text" name="marca" value="<%= carro.marca %>" required><br>
    <label>Modelo:</label>
    <input type="text" name="modelo" value="<%= carro.modelo %>" required><br>
    <label>Ano:</label>
    <input type="number" name="ano" value="<%= carro.ano %>" required><br>
    <label>Quantidade:</label>
    <input type="number" name="qtde_disponivel" value="<%= carro.qtde_disponivel %>" required><br>
    <button type="submit">Salvar</button>
    <a href="/carros/gerencia">Cancelar</a>
  </form>
</body>
</html>
```

---

## 7️⃣ CRIAR O CSS em public\css\style.css
```css
body {
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

nav {
  background-color: #333;
  width: 100%;
  padding: 10px;
  text-align: center;
  margin-bottom: 20px;
}

nav a {
  color: white;
  text-decoration: none;
  margin: 0 15px;
}

h1 { color: #333; }

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

table {
  width: 80%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

th {
  background-color: #333;
  color: white;
}
```

---

## 8️⃣ RODAR O SERVIDOR
```bash
node server.js
```

## 9️⃣ ACESSAR NO NAVEGADOR
```
http://localhost
```

---

## ✅ PÁGINAS DO SISTEMA
| Página | Endereço |
|--------|----------|
| Projects | http://localhost |
| Cadastro de usuário | http://localhost/usuarios/cadastro |
| Login | http://localhost/usuarios/login |
| Listagem de carros | http://localhost/carros |
| Gerência de carros | http://localhost/carros/gerencia |

---

## ⚠️ SE DER ERRO DE MONGODB
Verifique se as primeiras linhas do `server.js` são:
```js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
```

⚠️ Sempre que mudar o server.js, reinicia o servidor com Ctrl+C e node server.js de novo. Para arquivos .ejs não precisa reiniciar!
