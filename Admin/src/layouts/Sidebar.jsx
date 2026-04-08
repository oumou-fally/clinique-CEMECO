import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Home,
  ChevronDown,
  Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState(null)
  const location = useLocation()
  const { logout, user } = useAuth()

  const menuItems = [
    { icon: Home, label: 'Tableau de Bord', path: '/dashboard' },
    { icon: BarChart3, label: 'Statistiques', path: '/dashboard/analytics' },
    { icon: Users, label: 'Gestion Patients', path: '/dashboard/patients' },
    { icon: Calendar, label: 'Gestion Rendez-vous', path: '/dashboard/appointments' },
    { icon: FileText, label: 'Ordonnances', path: '/dashboard/records' },
    { icon: Settings, label: 'Configuration', path: '/dashboard/settings' },
    { icon: Shield, label: 'Panneau Admin', path: '/dashboard/admin', admin: true }
  ]

  const isActive = (path) => location.pathname === path

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
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-blue-700 bg-blue-950 sticky top-0">
          <div className="flex items-center gap-3 px-4">
            <div className="bg-white p-2 rounded-lg">
              <Activity className="w-6 h-6 text-blue-900" />
            </div>
            {isOpen && <span className="font-bold text-lg whitespace-nowrap">MedAdmin</span>}
          </div>
        </div>

        {/* User Info */}
        {isOpen && (
          <div className="p-4 border-b border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-blue-200 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <div key={item.path}>
              {item.admin && isOpen && index > 0 && (
                <div className="my-2 border-t border-blue-700"></div>
              )}
              <Link
                to={item.path}
                title={!isOpen ? item.label : ''}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? item.admin
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-blue-500 shadow-lg'
                    : `${item.admin ? 'hover:bg-yellow-600 text-yellow-100' : 'hover:bg-blue-700 text-blue-100'}`
                } ${!isOpen && 'justify-center'}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-blue-700 p-4">
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
