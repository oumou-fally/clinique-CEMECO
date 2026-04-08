const express = require('express');
const db = require('./config/db'); // connexion MySQL

const app = express();

// Middleware
app.use(express.json());

// Route de base
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Test connexion base de données
app.get('/test-db', (req, res) => {
  db.query('SELECT 1', (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur base de données');
    } else {
      res.send('Connexion MySQL réussie');
    }
  });
});

// 🔥 Import des routes
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientroute');

// 🔥 Utilisation des routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);

// 🔥 Route 404 (très important)
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// 🔥 Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur serveur" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});