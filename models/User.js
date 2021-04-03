// Importando o Mongoose dentro do arquivo

const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, min: 8 },
    birthDate: { type: Date }, // o required por default é false
    active: { type: Boolean, default: true }, //por default, o valor atribuído para essa variável é true
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  {
    timestamps: true, // ao criar ou atualizar o documento, o Mongoose vai criar dois timestamps de creation date e update at date
  }
);

// Mongoose criar dentro do Mongo uma coleção de "Users" que respeitem o Schema que declaramos na variável userSchema
const User = model('User', userSchema);

module.exports = User;
