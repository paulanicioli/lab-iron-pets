const express = require('express');

const hbs = require('hbs');

const homeRoutes = require('./routes/home.routes');
const petsRoutes = require('./routes/pets.routes');
const authRoutes = require('./routes/auth.routes');

const cookieParser = require('cookie-parser');

const app = express();

// Estabelecendo conexão com o banco de dados MongoDB
require('./config/mongodb.config');

// Lendo as variáveis de ambiente
require('dotenv').config();

// Usar a pasta public para os arquivos estáticos do projeto (JS< CSS, imagens)
app.use(express.static('public'));

app.use(cookieParser());
// Configurando as sessions/cookies
const sessionConfig = require('./config/session.config');

sessionConfig(app);

// Configurar Body Parser para capturar informações de formulários que
app.use(express.urlencoded({ extended: true }));

// Indicar para o Express que o HBS vai processar as views
app.set('view engine', 'hbs');
// Indicar em que pasta as views estão
app.set('views', __dirname + '/views');
// Podemos reutilizar um HTML em outras views
hbs.registerPartials(__dirname + '/views/partials');

// Configuração das rotas do express

// ROTAS PÚBLICAS

// Configurar rotas da Home Routes
app.use('/', homeRoutes);
// Configurar as rotas de autenticação
app.use('/', authRoutes);

// Essa callback dentro do app.use vai ser chamada em TODOS os requests que chegarem aqui
// Filtro de requests (bloqueador de requests)
app.use((req, res, next) => {
  if (req.session.currentUser) {
    return next(); // deixa ele passar para o próximo comando
  }
  res.redirect('/login');
});

// ROTAS PROTEGIDAS

// Configurar rotas da Pets Routes
app.use('/pets', petsRoutes);

// catch 404 and render a not-found.hbs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found', { layout: false });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error', { layout: false });
  }
});

app.listen(process.env.PORT, () => {
  console.log('App rodando na porta ', process.env.PORT);
});
