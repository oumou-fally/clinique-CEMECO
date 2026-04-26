import { useState, useEffect } from 'react'
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
  Users,
  ShieldAlert,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {

  const [isOpen, setIsOpen] = useState(true)
  const [notifCount, setNotifCount] = useState(0)

  const location = useLocation()
  const { deconnexion, user } = useAuth()

  const API_URL = 'http://localhost:3000'

  // ===================== NOTIFICATIONS SECRÉTAIRE =====================
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reservations/notifications/secretaire`)
      const data = await res.json()

      if (data.success) {
        setNotifCount(data.notifications.length)
      }

    } catch (error) {
      console.error('Erreur notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)

  }, [])

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Calendar, label: 'Rendez-vous', path: '/dashboard/rendez-vous' },
    { icon: Users, label: 'Médecins', path: '/dashboard/doctors' },
    { icon: Clock, label: 'Emploi du Temps', path: '/dashboard/emploi-du-temps' },
    { icon: ShieldAlert, label: 'Disponibilités', path: '/dashboard/disponibilites' },
    { icon: CheckCircle, label: 'Attribution', path: '/dashboard/attribution' },
    { icon: CreditCard, label: 'Facturation', path: '/dashboard/facturation' },

    // 🔔 NOTIFICATIONS AVEC BADGE
    {
      icon: Bell,
      label: 'Notifications',
      path: '/dashboard/notifications',
      badge: notifCount
    },

    { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' }
  ]

  const isActive = (path) => location.pathname === path
  const bgGradient = 'from-teal-800 to-emerald-800'
  const activeBg = 'bg-white/15'
  const hoverBg = 'hover:bg-white/10'

  return (
    <>
      {/* bouton mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed left-0 top-0 h-screen bg-linear-to-b ${bgGradient} text-white transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-0 lg:w-20'
          } overflow-hidden`}
      >

        {/* HEADER */}
        <div className="flex items-center justify-center h-20 border-b border-white/20">
          <div className="flex items-center gap-3 px-4">
            <div className="bg-white p-3 rounded-2xl">
              <Heart className="w-6 h-6 text-teal-800" />
            </div>

            {isOpen && (
              <div>
                <span className="font-bold text-lg">CEMECO</span>
                <p className="text-xs text-white/70">Cabinet de Cardiologie</p>
              </div>
            )}
          </div>
        </div>

        {/* USER */}
        {isOpen && (
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-white/70">Secrétaire</p>
              </div>
            </div>
          </div>
        )}

        {/* MENU */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${isActive(item.path) ? activeBg : hoverBg
                }`}
            >

              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5" />
                {isOpen && <span>{item.label}</span>}
              </div>

              {/* 🔴 BADGE NOTIF */}
              {item.badge > 0 && isOpen && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}

            </Link>
          ))}

        </nav>

        {/* LOGOUT */}
        <div className="border-t border-white/20 p-4">
          <button
            onClick={deconnexion}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-100 hover:bg-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span>Déconnexion</span>}
          </button>
        </div>

      </div>
    </>
  )
}