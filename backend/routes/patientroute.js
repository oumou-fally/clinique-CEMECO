const express = require("express");
const router = express.Router();
const Patient = require("../models/patient"); // ou Patient selon ton nom

// GET patients
router.get("/", async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// POST patient
router.post("/", async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.json(patient);
});

module.exports = router;