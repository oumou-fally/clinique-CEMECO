import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Connexion from './pages/Connexion'
import TableauDeBordSecretaire from './pages/TableauDeBordSecretaire'
import GestionRendezVous from './pages/GestionRendezVous'
import EmploiDuTempsMedecins from './pages/EmploiDuTempsMedecins'
import NouvelleFacture from './pages/nouvelle_facture'
import Medecins from './pages/Medecins'
import Notifications from './pages/Notifications'
import Parametres from './pages/parametres'
import DisponibilitesMedecins from './pages/DisponibilitesMedecins'
import AttributionMedecin from './pages/AttributionMedecin'

import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Connexion />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TableauDeBordSecretaire />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/rendez-vous"
          element={
            <ProtectedRoute>
              <GestionRendezVous />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/emploi-du-temps"
          element={
            <ProtectedRoute>
              <EmploiDuTempsMedecins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/facturation"
          element={
            <ProtectedRoute>
              <NouvelleFacture />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctors"
          element={
            <ProtectedRoute>
              <Medecins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Parametres />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/disponibilites"
          element={
            <ProtectedRoute>
              <DisponibilitesMedecins />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/attribution"
          element={
            <ProtectedRoute>
              <AttributionMedecin />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App

