//creation de la base de donnes 
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connecté à la base de données MongoDB.');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;