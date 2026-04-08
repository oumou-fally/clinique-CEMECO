import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/ConnexionMedecin'
import Dashboard from './pages/TableauDeBord'
import Patients from './pages/Patients'
import Consultations from './pages/Consultations'
import MedicalReports from './pages/RapportsMedicaux'
import Prescriptions from './pages/Prescriptions'
import Advice from './pages/GestionConseilsMedicaux'
import Notifications from './pages/Notifications'
import Settings from './pages/ParametresPage'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Doctor Routes */}
        <Route
          path="/dashboard/patients"
          element={
            <ProtectedRoute>
              <Patients />
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
          path="/dashboard/medical-reports"
          element={
            <ProtectedRoute>
              <MedicalReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/prescriptions"
          element={
            <ProtectedRoute>
              <Prescriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/advice"
          element={
            <ProtectedRoute>
              <Advice />
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
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
