import Layout from '../layouts/Layout';
import { User, Save, Mail, Phone, Stethoscope, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ParametresPage() {
  const { user, medecinId, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: ''
  });

  // Fetch the current profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const id = medecinId || user?.id;
        if (!id) {
          // Fallback: populate from auth context
          setFormData({
            nom: user?.nom ?? '',
            prenom: user?.prenom ?? '',
            email: user?.email ?? '',
            telephone: '',
            specialite: ''
          });
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3000/api/medecin/profil/${id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setFormData({
            nom: data.medecin.nom ?? '',
            prenom: data.medecin.prenom ?? '',
            email: data.medecin.email ?? '',
            telephone: data.medecin.telephone ?? '',
            specialite: data.medecin.specialite ?? ''
          });
        } else {
          // Fallback to auth context data
          setFormData({
            nom: user?.nom ?? '',
            prenom: user?.prenom ?? '',
            email: user?.email ?? '',
            telephone: '',
            specialite: ''
          });
        }
        setError('');
      } catch (e) {
        console.error(e);
        // Fallback to auth context on network error
        setFormData({
          nom: user?.nom ?? '',
          prenom: user?.prenom ?? '',
          email: user?.email ?? '',
          telephone: '',
          specialite: ''
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [medecinId, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const id = medecinId || user?.id;
      if (!id) {
        setError('Impossible de déterminer votre identifiant');
        return;
      }

      const res = await fetch(`http://localhost:3000/api/medecin/profil/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Profil mis à jour avec succès !');
        // Update localStorage with new data
        const updatedMedecin = {
          ...user,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          nomComplet: `${formData.prenom} ${formData.nom}`
        };
        localStorage.setItem('medecin', JSON.stringify(updatedMedecin));
      } else {
        throw new Error(data.message || `Enregistrement échoué (${res.status})`);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon Profil</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
              <p className="text-sm text-gray-500">Modifiez vos informations de profil</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="prenom">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nom">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> Email</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="telephone">
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> Téléphone</span>
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
            {/* Spécialité (lecture seule) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="specialite">
                <span className="flex items-center gap-1"><Stethoscope className="w-4 h-4" /> Spécialité</span>
              </label>
              <input
                id="specialite"
                name="specialite"
                type="text"
                value={formData.specialite}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">La spécialité ne peut être modifiée que par l'administrateur</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition"
            >
              {saving ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nom: user?.nom ?? '',
                  prenom: user?.prenom ?? '',
                  email: user?.email ?? '',
                  telephone: '',
                  specialite: formData.specialite
                });
                setError('');
                setSuccess('');
              }}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Annuler
            </button>
          </div>
        </div>

        {/* Déconnexion */}
        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:underline transition"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </div>
    </Layout>
  );
}
