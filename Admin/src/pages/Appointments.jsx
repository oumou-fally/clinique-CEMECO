import Layout from '../layouts/Layout'
import { AlertCircle } from 'lucide-react'

export default function Appointments() {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Rendez-vous</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Cette page sera remplie avec un calendrier interactif et la gestion complète des rendez-vous
            </p>
          </div>

          <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Calendrier des rendez-vous</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
