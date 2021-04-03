const { Schema, model, Types } = require('mongoose');

const petSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
    species: { type: String, required: true, enum: ['dog', 'cat', 'parrot'] },
    birthDate: { type: Date },
    image: { type: String, default: '' },
    owner: { type: Types.ObjectId, ref: 'User' }, // Referência para o dono do Pet (usamos o ID)
  },
  {
    timestamps: true, // ao criar ou atualizar o documento, o Mongoose vai criar dois timestamps de creation date e update at date
  }
);

// Mongoose criar dentro do Mongo uma coleção de "Pets" que respeitem o Schema que declaramos na variável userSchema
const Pet = model('Pet', petSchema);

module.exports = Pet;
