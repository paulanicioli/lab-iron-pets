const session = require('express-session');
const MongoStore = require('connect-mongo');
// Lendo as variáveis de ambiente
require('dotenv').config();

// Configurar o express-session (cookies & session)

module.exports = (app) => {
  // <== app is just a placeholder here
  // but will become a real "app" in the app.js
  // when this file gets imported/required there

  // use session
  app.use(
    session({
      secret: process.env.SESS_SECRET,
      resave: true,
      saveUninitialized: true,
      name: 'my-cookie',
      cookie: {
        path: '/',
        sameSite: false,
        httpOnly: true,
        maxAge: 60000, // 60 * 1000 ms === 1 min
      },
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        // ttl => time to live
        ttl: 60 * 60 * 24,
      }),
    })
  );
};
