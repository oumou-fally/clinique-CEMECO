import { Users, Plus, Calendar, AlertCircle, XCircle, User } from 'lucide-react'

export default function ModalRendezVous({
  modalOuvert,
  modalType,
  selectedRdv,
  formData,
  setFormData,
  gererChangement,
  fermerModal,
  ajouterRendezVous,
  creneauxDisponibles,
  medecins,
  estDisponible,
  messageErreur,
  onReporter
}) {
  if (!modalOuvert) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 p-8 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-emerald-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {modalType === 'ajouter' ? 'Nouveau rendez-vous' : 'Attribution / Report'}
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              {modalType === 'ajouter' ? 'Enregistrez une nouvelle demande de consultation' : 'Modifiez ou réattribuez ce rendez-vous'}
            </p>
          </div>
          <button onClick={fermerModal} className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-500 transition-all">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* ALERTE DISPONIBILITÉ */}
        {formData.id_medecin && formData.date_rendez_vous && !estDisponible(formData.id_medecin, formData.date_rendez_vous) && (
          <div className="mx-8 mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Attention : Médecin Absent</p>
              <p className="text-xs">Le médecin sélectionné est indisponible pour cette date.</p>
            </div>
          </div>
        )}

        {/* MESSAGE ERREUR */}
        {messageErreur && (
          <div className="mx-8 mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200 font-bold flex items-center gap-2">
            ⚠️ {messageErreur}
          </div>
        )}

        {/* CONTENU DU FORMULAIRE */}
        <div className="p-8">
          {modalType === 'ajouter' ? (
            <div className="space-y-8">
              {/* 1. Infos Patient */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-2">
                  <Users className="w-5 h-5" />
                  <span>1. Informations du patient</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Nom *</label>
                    <input required name="nom" value={formData.nom} onChange={gererChangement} placeholder="Ex: Dupont" className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Prénom *</label>
                    <input required name="prenom" value={formData.prenom} onChange={gererChangement} placeholder="Ex: Jean" className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Date de naissance *</label>
                    <input type="date" required name="date_naissance" value={formData.date_naissance} onChange={gererChangement} className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Sexe *</label>
                    <select name="sexe" value={formData.sexe} onChange={gererChangement} className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-bold">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Téléphone *</label>
                    <input required name="telephone" value={formData.telephone} onChange={gererChangement} placeholder="+224 ..." className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Email (optionnel)</label>
                    <input type="email" name="email" value={formData.email} onChange={gererChangement} placeholder="patient@mail.com" className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-medium" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Adresse (optionnel)</label>
                  <input name="adresse" value={formData.adresse} onChange={gererChangement} placeholder="Quartier, Rue ..." className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-medium" />
                </div>
              </div>

              {/* 2. Infos Médicales */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>2. Informations médicales</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Motif du rendez-vous *</label>
                  <textarea name="motif" value={formData.motif} onChange={gererChangement} placeholder="Ex: Consultation cardiologie, Contrôle ..." className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none min-h-[80px] font-medium" />
                </div>
              </div>

              {/* 3. Détails RDV */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-700 font-bold border-b pb-2">
                  <Calendar className="w-5 h-5" />
                  <span>3. Détails du rendez-vous</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Date souhaitée *</label>
                    <input type="date" name="date_rendez_vous" value={formData.date_rendez_vous} onChange={gererChangement} className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Heure souhaitée *</label>
                    <select name="heure_rendez_vous" value={formData.heure_rendez_vous} onChange={gererChangement} className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-bold">
                      <option value="">Choisir</option>
                      {creneauxDisponibles.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Médecin *</label>
                  <select name="id_medecin" value={formData.id_medecin} onChange={gererChangement} className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-bold">
                    <option value="">Sélectionner un médecin</option>
                    {medecins.map(m => (
                      <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* FORMULAIRE REPORT / REATTRIBUTION */
            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <User className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-slate-400 tracking-wider">Patient</p>
                    <p className="text-xl font-bold text-slate-900">{selectedRdv?.prenom} {selectedRdv?.nom}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Nouvelle Date</label>
                  <input type="date" value={formData.date_rendez_vous} onChange={(e) => setFormData({ ...formData, date_rendez_vous: e.target.value })} className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Nouvelle Heure</label>
                  <select value={formData.heure_rendez_vous} onChange={(e) => setFormData({ ...formData, heure_rendez_vous: e.target.value })} className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-bold">
                    <option value="">Choisir</option>
                    {creneauxDisponibles.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Modifier le Médecin</label>
                <select 
                  value={formData.id_medecin} 
                  onChange={(e) => setFormData({ ...formData, id_medecin: e.target.value })} 
                  className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 px-4 py-3 focus:bg-white focus:border-teal-500 transition-all outline-none font-bold"
                >
                  <option value="">Sélectionner un médecin</option>
                  {medecins.map(m => (
                    <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 sticky bottom-0">
          <button onClick={fermerModal} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">
            Annuler
          </button>
          <button
            onClick={modalType === 'ajouter' ? ajouterRendezVous : onReporter}
            className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-100 transition-all active:scale-95"
          >
            {modalType === 'ajouter' ? 'Enregistrer le rendez-vous' : 'Confirmer les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
}
