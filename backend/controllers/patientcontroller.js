const Patient = require('../models/patient');

// Ajouter patient
exports.createPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Voir tous les patients
exports.getPatients = async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
};