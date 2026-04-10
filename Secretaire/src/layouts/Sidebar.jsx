import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Heart,
  Bell,
  Clock,
  CreditCard,
  Users
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()
  const { deconnexion, user } = useAuth()

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Calendar, label: 'Rendez-vous', path: '/dashboard/rendez-vous' },
    { icon: Clock, label: 'Emploi du Temps', path: '/dashboard/emploi-du-temps' },
    { icon: Users, label: 'Médecins', path: '/dashboard/doctors' },
    { icon: CreditCard, label: 'Facturation', path: '/dashboard/facturation' },
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' }
  ]

  const isActive = (path) => location.pathname === path
  const bgGradient = 'from-teal-800 to-emerald-800'
  const activeBg = 'bg-white/15'
  const hoverBg = 'hover:bg-white/10'

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed left-0 top-0 h-screen bg-linear-to-b ${bgGradient} text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="flex items-center justify-center h-20 border-b border-white/20 sticky top-0">
          <div className="flex items-center gap-3 px-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <Heart className="w-6 h-6 text-teal-800" />
            </div>
            {isOpen && (
              <div>
                <span className="font-bold text-lg whitespace-nowrap">CEMECO</span>
                <p className="text-xs text-white/70 whitespace-normal">Cabinet de Cardiologie</p>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-white/70 truncate">Secrétaire Médicale</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={!isOpen ? item.label : ''}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive(item.path)
                  ? `${activeBg} shadow-lg`
                  : `${hoverBg} text-white/90`
              } ${!isOpen && 'justify-center'}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/20 p-4">
          <button
            onClick={deconnexion}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-100 hover:bg-red-500/20 transition-all duration-200 ${
              !isOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isOpen && <span className="font-medium">Déconnexion</span>}
          </button>
        </div>
      </div>

      <div className={`${isOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`} />
    </>
  )
}
