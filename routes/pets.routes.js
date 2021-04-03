const express = require('express');
const { format } = require('date-format-parse');

const router = express();

const Pet = require('../models/Pet');

const User = require('../models/User');

// Vamos utilizar o fileUploader como middleware dentro da rota
const fileUploader = require('../config/cloudinary.config');

router.get('/', (req, res) => {
  const { petName } = req.query;

  Pet.find({
    owner: req.session.currentUser._id,
    name: { $regex: new RegExp(petName, 'i') },
  }).then((petsFromDatabase) => {
    res.render('pet', {
      pets: petsFromDatabase,
      currentUser: req.session.currentUser,
    });
  });
});

// Entregar o HTML com o formulário de cadastro do novo pet
router.get('/new', (req, res) => {
  res.render('newPet', { currentUser: req.session.currentUser });
});

// Receber os dados do form para inserir um novo Pet no banco
router.post('/new', fileUploader.single('petImage'), (req, res) => {
  // Via POST, as informações vão via Body, ou corpo da requisição (diferentemente do GET que envia query string) -- é um método mais seguro pois as informações não ficam evidenciadas na URL
  const { petName, petSpecies, petBirthDate } = req.body;
  // O Express sozinho não sabe ler o body, precisamos instalar o body-parser
  const newPet = {
    name: petName,
    image: req.file.path,
    species: petSpecies,
    birthDate: petBirthDate,
    owner: req.session.currentUser._id,
  };

  Pet.create(newPet)
    .then(() => {
      // Redirect não é view, é a rota absoluta
      res.redirect('/pets');
    })
    .catch((error) => console.log(error));
});

// /:petId --> pode vir escrito QUALQUER COISA na URL
router.get('/:petId', (req, res) => {
  const { petId } = req.params;

  Pet.findOne({ _id: petId, owner: req.session.currentUser._id })
    .populate('owner')
    .then((petFromDatabase) => {
      const birthDateFormatted = format(
        petFromDatabase.birthDate,
        'YYYY-MM-DD'
      );

      const mongoDbObject = petFromDatabase.toJSON();

      const newObject = { ...mongoDbObject, birthDate: birthDateFormatted };

      const speciesValues = [
        { value: 'dog', text: 'Cachorro' },
        { value: 'cat', text: 'Gato' },
        { value: 'parrot', text: 'Papagaio' },
      ];

      const petIndex = speciesValues.findIndex((speciesOption) => {
        return speciesOption.value === newObject.species;
      });

      const foundSpeciesValue = speciesValues[petIndex];

      speciesValues.splice(petIndex, 1);

      speciesValues.unshift(foundSpeciesValue);

      res.render('petDetail', {
        pet: newObject,
        speciesValues,
        currentUser: req.session.currentUser,
      });
    })
    .catch(() => {
      res.render('not-found');
    });
});

router.post('/edit/:petId', (req, res) => {
  const { petName, petImage, petSpecies, petBirthDate } = req.body;
  const { petId } = req.params;

  Pet.findAndUpdate(
    { _id: petId, owner_id: req.session.currentUser._id },
    {
      name: petName,
      image: petImage,
      species: petSpecies,
      birthDate: new Date(petBirthDate),
    }
  )
    .then(() => {
      res.redirect(`/pets/${petId}`);
    })
    .catch((error) => {
      console.log('Error editing Pet information ==>', error);
      res.render('not-found');
    });
});

module.exports = router;
