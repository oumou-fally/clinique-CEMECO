import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Stethoscope,
  Heart,
  Bell
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()
  const { logout, user } = useAuth()

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Calendar, label: 'Mes Rendez-vous', path: '/dashboard/appointments' },
    { icon: FileText, label: 'Mon Dossier Médical', path: '/dashboard/medical-record' },
    { icon: Stethoscope, label: 'Médecins', path: '/dashboard/doctors' },
    { icon: Heart, label: 'Conseils Médicaux', path: '/dashboard/consultations' },
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' }
  ]

  const isActive = (path) => location.pathname === path
  const bgGradient = 'from-teal-900 to-green-800'
  const activeBg = 'bg-teal-500'
  const hoverBg = 'hover:bg-teal-700'

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b ${bgGradient} text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-white border-opacity-20 sticky top-0">
          <div className="flex items-center gap-3 px-4">
            <div className="bg-white p-2 rounded-lg">
              <Heart className={`w-6 h-6 ${user?.role === 'admin' ? 'text-blue-900' : 'text-red-900'}`} />
            </div>
            {isOpen && (
              <div>
                <span className="font-bold text-lg whitespace-nowrap">CEMECO</span>
                <p className="text-xs text-white text-opacity-70 whitespace-normal">Cardiologie</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {isOpen && (
          <div className="p-4 border-b border-white border-opacity-20">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                user?.role === 'admin' ? 'bg-blue-400' : 'bg-teal-400'
              }`}>
                {user?.prenom?.charAt(0) || user?.nomComplet?.charAt(0) || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.nomComplet || `${user?.prenom} ${user?.nom}`}</p>
                <p className="text-xs text-white text-opacity-70 truncate">Patient</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={!isOpen ? item.label : ''}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? `${activeBg} shadow-lg`
                  : `${hoverBg} text-white text-opacity-80`
              } ${!isOpen && 'justify-center'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white border-opacity-20 p-4">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500 hover:text-white transition-all duration-200 ${
              !isOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <div
        className={`hidden lg:flex fixed left-64 top-4 z-30 ${
          !isOpen && 'left-20'
        } transition-all duration-300`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          title={isOpen ? 'Réduire' : 'Agrandir'}
        >
          {isOpen ? (
            <X className="w-4 h-4 text-gray-600" />
          ) : (
            <Menu className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Main Content Area Padding */}
      <div className={`${isOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`} />
    </>
  )
}
