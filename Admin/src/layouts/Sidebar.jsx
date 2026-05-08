import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Home,
  Eye,
  DollarSign,
  Tag
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()
  const { logout, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isSuperAdmin = user?.role === 'super_admin'

  const menuItems = [
    { icon: Home, label: 'Tableau de Bord', path: '/dashboard', roles: ['admin', 'super_admin'] },
    { icon: Users, label: 'Gestion Utilisateurs', path: '/dashboard/users', roles: ['super_admin'] }, // Uniquement Super Admin
    { icon: Eye, label: 'Supervision', path: '/dashboard/supervision', roles: ['admin', 'super_admin'] },
    { icon: DollarSign, label: 'Finances', path: '/dashboard/finance', roles: ['super_admin'] },
    { icon: Tag, label: 'Gestion Tarifs', path: '/dashboard/tarifs', roles: ['super_admin'] },
    { icon: Settings, label: 'Gestion Système', path: '/dashboard/system', roles: ['super_admin'] },
  ]

  // Filtrer les menus selon le rôle
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role))

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
            {isOpen && (
              <div>
                <span className="font-bold text-lg whitespace-nowrap">CEMECO</span>
                <p className="text-xs text-blue-200 whitespace-normal">Cardiologie</p>
              </div>
            )}
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
                <p className="text-sm font-semibold truncate">
                  {(user?.nomComplet || user?.name)?.toLowerCase().includes('yaya') ? 'Pr.' : 'Dr.'} {user?.nomComplet || user?.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={!isOpen ? item.label : ''}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-500 shadow-lg text-white'
                  : 'hover:bg-blue-700 text-blue-100'
              } ${!isOpen && 'justify-center'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
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
