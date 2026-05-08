import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Connexion from './pages/Connexion'
import TableauDeBordPatient from './pages/TableauDeBordPatient'
import MesRendezVous from './pages/MesRendezVous'
import DossierMedical from './pages/DossierMedical'
import Medecins from './pages/Medecins'
import Consultations from './pages/Consultations'
import Notifications from './pages/Notifications'
import ParametresCompte from './pages/ParametresCompte'
import MotDePasseOublie from './pages/MotDePasseOublie'
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
          path="/forgot-password"
          element={<MotDePasseOublie />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TableauDeBordPatient />
            </ProtectedRoute>
          }
        />
        {/* Patient Routes */}
        <Route
          path="/dashboard/appointments"
          element={
            <ProtectedRoute>
              <MesRendezVous />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/medical-record"
          element={
            <ProtectedRoute>
              <DossierMedical />
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
          path="/dashboard/consultations"
          element={
            <ProtectedRoute>
              <Consultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/consultations/:medecinId"
          element={
            <ProtectedRoute>
              <Consultations />
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
              <ParametresCompte />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <ParametresCompte />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
