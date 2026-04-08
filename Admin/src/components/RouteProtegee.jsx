import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';   // Optionnel : icône de chargement

export default function RouteProtegee({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // ====================== ÉTAT DE CHARGEMENT ======================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Chargement en cours...</p>
          <p className="text-sm text-gray-500 mt-1">Vérification de l'authentification</p>
        </div>
      </div>
    );
  }

  // ====================== REDIRECTION SI NON CONNECTÉ ======================
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ====================== AUTORISÉ - AFFICHAGE DU CONTENU ======================
  return children;
}