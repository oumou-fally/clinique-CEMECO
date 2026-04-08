const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  age: Number,
  telephone: String,
});

module.exports = mongoose.model("Patient", patientSchema);