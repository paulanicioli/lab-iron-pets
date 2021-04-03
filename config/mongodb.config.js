const mongoose = require('mongoose');
require('dotenv').config();

// Estabelecendo conexão com o banco de dados
mongoose
  .connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado com o banco de dados'));

module.exports;
