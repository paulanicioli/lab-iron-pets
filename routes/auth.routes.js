const express = require('express');

const router = express();

const User = require('../models/User');

const bcrypt = require('bcrypt');

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  const { userName, userEmail, userPassword, userBirthDate } = req.body;
  //   Verificar se todas as informação necessárias foram enviadas
  const validationErrors = {};

  if (userName.trim().length === 0) {
    validationErrors.userNameError = 'Campo Obrigatório';
  }

  if (userEmail.trim().length === 0) {
    validationErrors.userEmailError = 'Campo Obrigatório';
  }

  if (userPassword.trim().length === 0) {
    validationErrors.userPasswordError = 'Campo Obrigatório';
  }

  if (userBirthDate.trim().length === 0) {
    validationErrors.userBirthDateError = 'Campo Obrigatório';
  }

  // se houver pelo menos um erro....
  if (Object.keys(validationErrors).length > 0) {
    return res.render('signup', { validationErrors });
    // Damos return para garantir que nenhum código abaixo seja executado
  }
  // Verificar se o usuário já foi cadastrado anteriormente, através do email
  try {
    const userFromDb = await User.findOne({ email: userEmail }); // dentro de uma função assíncrona, quando colocamos await, o comando vira síncrono (tem que esperar ele rodar para fazer o próximo comando)
    if (userFromDb) {
      return res.render('signup', {
        userNameError: 'Este usuário já está cadastrado!',
      });
    }

    // Encriptar a senha que recebemos do usuário
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const encryptedPassword = bcrypt.hashSync(userPassword, salt);

    // Salvar usuário no banco de dados

    await User.create({
      name: userName,
      email: userEmail,
      password: encryptedPassword,
      birthDate: new Date(userBirthDate), // Transformar a data que veio como string em date format
    });
    res.redirect('/login');
  } catch (error) {
    console.log('Erro na rota /signup ===> ', error);
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // verificação dos campos
    const userFromDb = await User.findOne({ email: userEmail });

    if (!userFromDb) {
      console.log('Could not find user in db');
      return res.render('login', {
        userEmailError: 'Usuário ou senha incorretos',
        userPasswordError: 'Usuário ou senha incorretos',
      });
    }
    const isPasswordValid = bcrypt.compareSync(
      userPassword,
      userFromDb.password
    );

    if (!isPasswordValid) {
      return res.render('login', {
        userEmailError: 'Usuário ou senha incorretos',
        userPasswordError: 'Usuário ou senha incorretos',
      });
    }

    // Iniciar uma sessão para este usuário

    // Dentro do cookie (req.session), estamos criando uma propriedade que carrega as informações do usuário encontrado na base de dados
    req.session.currentUser = userFromDb;

    // Encaminha o usuário para a sua area logada
    res.redirect('/pets');
  } catch (error) {
    console.log('Error in the login route ===> ', error);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();

  res.redirect('/login');
});

module.exports = router;
