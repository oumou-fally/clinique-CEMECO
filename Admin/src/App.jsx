import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import RouteProtegee from './components/admin/RouteProtegee'
import PageConnexion from './pages/PageConnexion'
import Dashboard from './pages/Dashboard'
import GestionUtilisateurs from './pages/GestionUtilisateurs'
import GestionSysteme from './pages/GestionSysteme'
import Supervision from './pages/Supervision'
import GestionFinanciere from './pages/GestionFinanciere'
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
          path="/dashboard/users"
          element={
            <RouteProtegee>
              <GestionUtilisateurs />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/system"
          element={
            <RouteProtegee>
              <GestionSysteme />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/supervision"
          element={
            <RouteProtegee>
              <Supervision />
            </RouteProtegee>
          }
        />
        <Route
          path="/dashboard/finance"
          element={
            <RouteProtegee>
              <GestionFinanciere />
            </RouteProtegee>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
