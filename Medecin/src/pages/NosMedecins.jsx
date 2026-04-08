import { useState } from 'react';
import Layout from '../layouts/Layout';
import { 
  Star, MapPin, Phone, Mail, Calendar, Video, 
  Search, Filter, Clock 
} from 'lucide-react';

export default function NosMedecins() {
  const [recherche, setRecherche] = useState('');
  const [specialiteFiltre, setSpecialiteFiltre] = useState('Tous');

  const medecins = [
    {
      id: 1,
      nom: 'Prof. Elhadj Yaya Baldé',
      specialite: 'Médecin Généraliste - Propriétaire',
      note: 4.8,
      avis: 128,
      experience: '20 ans',
      lieu: 'Clinique Santé Plus - Bureau 301',
      telephone: '+224 666 77 88 99',
      email: 'elhadj.balde@clinic.com',
      disponibilite: 'Lundi à Vendredi',
      prochainRDV: 'Demain 14:30',
      image: '👨‍⚕️'
    },
    {
      id: 2,
      nom: 'Dr. Mamadou Diallo',
      specialite: 'Cardiologue',
      note: 4.9,
      avis: 156,
      experience: '15 ans',
      lieu: 'Clinique Santé Plus - Bureau 105',
      telephone: '+224 655 44 33 22',
      email: 'mamadou.diallo@clinic.com',
      disponibilite: 'Lundi, Mercredi, Vendredi',
      prochainRDV: '20 Avril - 10:00',
      image: '👨‍⚕️'
    },
    {
      id: 3,
      nom: 'Dr. Thierno Siradjo Baldé',
      specialite: 'Dermatologue',
      note: 4.7,
      avis: 95,
      experience: '8 ans',
      lieu: 'Clinique Santé Plus - Bureau 202',
      telephone: '+224 622 11 22 33',
      email: 'thierno.siradjo@clinic.com',
      disponibilite: 'Mardi à Samedi',
      prochainRDV: '19 Avril - 16:00',
      image: '👨‍⚕️'
    },
    {
      id: 4,
      nom: 'Dr. Thierno Boubacar Barry',
      specialite: 'Orthopédiste',
      note: 4.6,
      avis: 112,
      experience: '10 ans',
      lieu: 'Clinique Santé Plus - Bureau 103',
      telephone: '+224 611 99 88 77',
      email: 'thierno.boubacar@clinic.com',
      disponibilite: 'Tous les jours sauf dimanche',
      prochainRDV: 'Lundi 15 Avril - 09:00',
      image: '👨‍⚕️'
    }
  ];

  const specialites = [
    'Tous', 'Médecin Généraliste', 'Cardiologue', 'Dermatologue', 
    'Orthopédiste', 'Pédiatre', 'Neurologue'
  ];

  // Filtrage
  const medecinsFiltres = medecins.filter(medecin => {
    const correspondRecherche = 
      medecin.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(recherche.toLowerCase());
    
    const correspondSpecialite = 
      specialiteFiltre === 'Tous' || medecin.specialite.includes(specialiteFiltre);

    return correspondRecherche && correspondSpecialite;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nos Médecins</h1>
          <p className="text-gray-600 mt-2">Trouvez le spécialiste qu'il vous faut</p>
        </div>

        {/* Recherche et Filtres */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un médecin par nom ou spécialité..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              <Filter className="w-5 h-5" />
              Filtres avancés
            </button>
          </div>

          {/* Filtre par spécialité */}
          <div className="flex flex-wrap gap-2 mt-6">
            {specialites.map((spec, index) => (
              <button
                key={index}
                onClick={() => setSpecialiteFiltre(spec)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  specialiteFiltre === spec
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des médecins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {medecinsFiltres.map((medecin) => (
            <div
              key={medecin.id}
              className="bg-white rounded-2xl shadow hover:shadow-2xl transition overflow-hidden"
            >
              {/* En-tête coloré */}
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="text-6xl mb-4">{medecin.image}</div>
                  <div className="flex items-center gap-1 bg-white/20 px-4 py-1 rounded-full">
                    <Star className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{medecin.note}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{medecin.nom}</h3>
                <p className="text-teal-100 mt-1">{medecin.specialite}</p>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(medecin.note) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">({medecin.avis} avis)</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase text-gray-500">Expérience</p>
                      <p className="font-medium">{medecin.experience}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase text-gray-500">Localisation</p>
                      <p className="font-medium">{medecin.lieu}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase text-gray-500">Disponibilité</p>
                      <p className="font-medium">{medecin.disponibilite}</p>
                    </div>
                  </div>

                  <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
                    <p className="text-xs uppercase text-teal-700 font-semibold">Prochain RDV disponible</p>
                    <p className="font-bold text-teal-800 mt-1">{medecin.prochainRDV}</p>
                  </div>
                </div>

                {/* Contacts */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{medecin.telephone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{medecin.email}</span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Prendre RDV
                  </button>
                  <button className="flex-1 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    <Video className="w-5 h-5" />
                    Téléconsultation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton Voir plus */}
        <div className="text-center mt-10">
          <button className="px-10 py-3.5 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-2xl font-semibold transition">
            Voir tous les médecins
          </button>
        </div>
      </div>
    </Layout>
  );
}