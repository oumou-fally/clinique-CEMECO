import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Printer, Pill } from 'lucide-react';

export default function OrdonnanceModal({ isOpen, onClose, reservation, medecinId, doctorName }) {
  const [medicaments, setMedicaments] = useState([{ nom: '', dosage: '' }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reservation) {
      fetchExistingOrdonnance();
    } else if (isOpen) {
      setMedicaments([{ nom: '', dosage: '' }]);
    }
  }, [isOpen, reservation]);

  const fetchExistingOrdonnance = async () => {
    try {
      const res = await fetch(`/api/medecin/consultations/ordonnance/${reservation.id}`);
      const data = await res.json();
      if (data.success && data.ordonnance) {
        const meds = Array.isArray(data.ordonnance.medicaments) ? data.ordonnance.medicaments : [];
        setMedicaments(meds.length > 0 ? meds : [{ nom: '', dosage: '' }]);
      } else {
        setMedicaments([{ nom: '', dosage: '' }]);
      }
    } catch (error) {
      console.error('Erreur fetch ordonnance:', error);
      setMedicaments([{ nom: '', dosage: '' }]);
    }
  };

  const addMedicament = () => {
    setMedicaments([...medicaments, { nom: '', dosage: '' }]);
  };

  const removeMedicament = (index) => {
    const newMeds = medicaments.filter((_, i) => i !== index);
    setMedicaments(newMeds.length > 0 ? newMeds : [{ nom: '', dosage: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const newMeds = [...medicaments];
    newMeds[index][field] = value;
    setMedicaments(newMeds);
  };

  const handleSave = async () => {
    const validMeds = medicaments.filter(m => m.nom.trim() !== '' && m.dosage.trim() !== '');
    if (validMeds.length === 0) {
      alert('Veuillez ajouter au moins un médicament valide.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/medecin/consultations/ordonnance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_consultation: reservation.id,
          medicaments: validMeds
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Ordonnance enregistrée avec succès !');
        onClose();
      }
    } catch (error) {
      console.error('Erreur sauvegarde ordonnance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-300 print:shadow-none print:border-none print:max-w-none print:w-full print:h-full">
        
        {/* Header - Masqué à l'impression */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Nouvelle Ordonnance</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Patient: {reservation?.prenom} {reservation?.nom}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Zone d'impression */}
        <div className="p-10 flex-1 overflow-y-auto print:overflow-visible print:p-0">
          
          {/* En-tête clinique pour l'impression */}
          <div className="hidden print:block mb-12 border-b-2 border-gray-900 pb-8 text-center">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">Clinique CEMECO</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Service de Cardiologie & Consultations Générales</p>
            <div className="mt-6 flex justify-between text-left px-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Médecin Prescripteur</p>
                <p className="font-bold text-gray-900">Dr. {doctorName || 'Consultant'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Date de l'ordonnance</p>
                <p className="font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="hidden print:block mb-8">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Patient</p>
            <p className="text-2xl font-black text-gray-900 capitalize border-b pb-2">{reservation?.prenom} {reservation?.nom}</p>
          </div>

          {/* Formulaire / Liste des médicaments */}
          <div className="space-y-6">
            <div className="print:hidden">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-l-4 border-blue-600 pl-3">Prescription Médicamenteuse</p>
            </div>

            <div className="space-y-4 print:space-y-6">
              {medicaments.map((med, index) => (
                <div key={index} className="flex gap-4 items-end group print:border-b print:pb-4 print:border-gray-100">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase print:hidden">Médicament</label>
                    <input 
                      type="text"
                      placeholder="Nom du médicament (ex: Doliprane 1000mg)"
                      value={med.nom}
                      onChange={(e) => handleInputChange(index, 'nom', e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl transition-all font-bold text-gray-900 print:bg-white print:p-0 print:text-xl"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase print:hidden">Posologie / Dosage</label>
                    <input 
                      type="text"
                      placeholder="Posologie (ex: 1 gélule 3x par jour)"
                      value={med.dosage}
                      onChange={(e) => handleInputChange(index, 'dosage', e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl transition-all font-medium text-gray-600 print:bg-white print:p-0 print:text-lg print:italic"
                    />
                  </div>
                  <button 
                    onClick={() => removeMedicament(index)}
                    className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all mb-0.5 print:hidden opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={addMedicament}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 print:hidden"
            >
              <Plus className="w-5 h-5" />
              Ajouter une ligne
            </button>
          </div>

          {/* Signature pour l'impression */}
          <div className="hidden print:flex flex-col items-end mt-20 pr-10">
            <p className="font-bold text-gray-400 uppercase text-[10px] mb-12">Signature & Cachet du Médecin</p>
            <div className="w-48 h-24 border-2 border-dashed border-gray-200 rounded-xl"></div>
          </div>
        </div>

        {/* Footer Modal - Masqué à l'impression */}
        <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/50 print:hidden">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <Printer className="w-5 h-5" />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}
