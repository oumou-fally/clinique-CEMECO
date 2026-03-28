import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import SecretaryDashboard from './pages/SecretaryDashboard'
import AppointmentManager from './pages/AppointmentManager'
import Schedule from './pages/Schedule'
import Billing from './pages/Billing'
import DoctorManagement from './pages/DoctorManagement'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

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
              <SecretaryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/appointments"
          element={
            <ProtectedRoute>
              <AppointmentManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctors"
          element={
            <ProtectedRoute>
              <DoctorManagement />
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

