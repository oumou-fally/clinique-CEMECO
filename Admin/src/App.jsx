import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import RouteProtegee from './components/admin/RouteProtegee'
import PageConnexion from './pages/PageConnexion'
import Dashboard from './pages/Dashboard'
import GestionPatients from './pages/GestionPatients'
import GestionRendezVous from './pages/GestionRendezVous'
import GestionOrdonnances from './pages/GestionOrdonnances'
import ParametresClinique from './pages/ParametresClinique'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PageConnexion />}
        />
        <Route
          path="/dashboard"
          element={
            <RouteProtegee>
              <Dashboard />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <RouteProtegee>
              <Dashboard />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/patients"
          element={
            <RouteProtegee>
              <GestionPatients />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/appointments"
          element={
            <RouteProtegee>
              <GestionRendezVous />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/records"
          element={
            <RouteProtegee>
              <GestionOrdonnances />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <RouteProtegee>
              <ParametresClinique />
            </RouteProtegee>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
