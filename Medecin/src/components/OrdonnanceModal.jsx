import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Printer, Pill, Stethoscope, Activity } from 'lucide-react';

export default function OrdonnanceModal({ isOpen, onClose, reservation, medecinId, doctorName, mode = 'edit' }) {
  const [medicaments, setMedicaments] = useState([{ nom: '', dosage: '' }]);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (isOpen && reservation) {
      setIsDataLoaded(false);
      loadAllData();
    } else if (isOpen) {
      setMedicaments([{ nom: '', dosage: '' }]);
      setConsultation(null);
      setIsDataLoaded(true);
    }
  }, [isOpen, reservation]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Ordonnance
      const resOrd = await fetch(`${API_URL}/api/medecin/consultations/ordonnance/${reservation.id}`);
      const dataOrd = await resOrd.json();
      
      if (dataOrd.success && dataOrd.ordonnance) {
        const meds = Array.isArray(dataOrd.ordonnance.medicaments) ? dataOrd.ordonnance.medicaments : [];
        setMedicaments(meds.length > 0 ? meds : [{ nom: '', dosage: '' }]);
      } else {
        setMedicaments([{ nom: '', dosage: '' }]);
      }

      // 2. Fetch Consultation Detail
      const resCons = await fetch(`${API_URL}/api/medecin/consultations/detail/${reservation.id}`);
      const dataCons = await resCons.json();
      if (dataCons.success) {
        setConsultation(dataCons.consultation);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
      setIsDataLoaded(true);
    }
  };

  // Déclencher l'impression automatique si le mode est 'print'
  useEffect(() => {
    if (isOpen && mode === 'print' && isDataLoaded && !loading) {
      const timer = setTimeout(() => {
        window.print();
        // Optionnel: fermer la modale après impression si on veut un flux super rapide
        // onClose(); 
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, isDataLoaded, loading]);

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
      const res = await fetch(`${API_URL}/api/medecin/consultations/ordonnance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_reservation: reservation.id,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] print:p-0 print:bg-white print:static print:block">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-300 print:shadow-none print:border-none print:max-w-none print:w-full print:h-auto print:rounded-none print:static">
        
        {/* Header - Masqué à l'impression */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Gestion Ordonnance</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Patient: {reservation?.prenom} {reservation?.nom}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Zone d'impression */}
        <div className="p-10 flex-1 overflow-y-auto print:overflow-visible print:p-6 print:text-black">
          
          <div className="mb-6 rounded-3xl border border-gray-200 bg-gray-50 p-4 text-center print:bg-white print:border-black print:border-t-0 print:border-x-0 print:border-b-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cabinet de Cardiologie - CEMECO</p>
            <p className="text-sm font-bold text-gray-900">KIPE BP: 1384 • CONAKRY • REPUBLIQUE DE GUINEE</p>
          </div>

          {/* En-tête clinique pour l'impression */}
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4 text-center">
            <div className="flex justify-between items-center mb-2">
               <div className="text-left">
                  <h1 className="text-3xl font-black uppercase tracking-tighter">Cabinet de Cardiologie - CEMECO</h1>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">KIPE BP: 1384 • Conakry • République de Guinée</p>
               </div>
               <div className="text-right text-[8px] font-bold text-gray-400">
                  <p>Cabinet de Cardiologie</p>
                  <p>Conakry, République de Guinée</p>
               </div>
            </div>
            
            <div className="mt-4 flex justify-between text-left border-t border-gray-100 pt-4">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase">Médecin Prescripteur</p>
                <p className="text-lg font-black leading-tight">Dr. {doctorName || 'Consultant'}</p>
                <p className="text-[10px] font-bold text-blue-600">Spécialiste Cardiologie</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-gray-400 uppercase">Fait à Conakry, le</p>
                <p className="text-lg font-black leading-tight">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="hidden print:block mb-6 bg-gray-50/50 p-4 rounded-xl border-l-4 border-black">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Patient</p>
                <p className="text-xl font-black capitalize">{reservation?.prenom} {reservation?.nom}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">ID Patient</p>
                <p className="font-bold text-sm">#{reservation?.patient_id || '---'}</p>
              </div>
            </div>
          </div>

          {/* Rappel Consultation pour l'impression */}
          {consultation && (
            <div className="hidden print:block mb-6 space-y-2">
               <h3 className="text-[10px] font-black uppercase tracking-widest border-b pb-1 flex items-center gap-2">
                 <Stethoscope className="w-3 h-3" /> Résumé de la Consultation
               </h3>
               <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-gray-50/30 p-2 rounded-lg border border-gray-100">
                    <p className="text-[7px] font-black text-gray-400 uppercase">Tension</p>
                    <p className="text-xs font-bold">{consultation.pa || '--'}</p>
                  </div>
                  <div className="bg-gray-50/30 p-2 rounded-lg border border-gray-100">
                    <p className="text-[7px] font-black text-gray-400 uppercase">Poids</p>
                    <p className="text-xs font-bold">{consultation.poids || '--'} kg</p>
                  </div>
                  <div className="bg-gray-50/30 p-2 rounded-lg border border-gray-100">
                    <p className="text-[7px] font-black text-gray-400 uppercase">Temp.</p>
                    <p className="text-xs font-bold">{consultation.temperature || '--'} °C</p>
                  </div>
               </div>
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Diagnostic</p>
                  <p className="font-bold text-sm">{consultation.diagnostic || 'Non spécifié'}</p>
               </div>
            </div>
          )}

          {/* Formulaire / Liste des médicaments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
               <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                 <Pill className="w-5 h-5 text-blue-600 print:text-black" />
                 ORDONNANCE
               </h3>
            </div>

            <div className="space-y-2 print:space-y-4 mt-4">
              {medicaments.map((med, index) => (
                <div key={index} className="flex gap-4 items-start group print:pb-2 print:border-b print:border-gray-50">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase print:hidden">Médicament</label>
                    <input 
                      type="text"
                      placeholder="Nom du médicament..."
                      value={med.nom}
                      onChange={(e) => handleInputChange(index, 'nom', e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl transition-all font-bold text-gray-900 print:hidden"
                    />
                    {/* Affichage statique pour l'impression */}
                    <div className="hidden print:block">
                       <p className="text-base font-black text-black">
                          <span className="inline-block w-5 h-5 border border-black mr-2 text-center leading-4 text-[10px]">R/</span>
                          {med.nom || '___________________________'}
                       </p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase print:hidden">Posologie / Dosage</label>
                    <input 
                      type="text"
                      placeholder="Posologie..."
                      value={med.dosage}
                      onChange={(e) => handleInputChange(index, 'dosage', e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl transition-all font-medium text-gray-600 print:hidden"
                    />
                    {/* Affichage statique pour l'impression */}
                    <div className="hidden print:block pl-7">
                       <p className="text-sm font-bold text-gray-700 italic">
                          {med.dosage || '___________________________'}
                       </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeMedicament(index)}
                    className="p-4 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all print:hidden opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={addMedicament}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-bold hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 print:hidden"
            >
              <Plus className="w-5 h-5" />
              Ajouter une ligne
            </button>
          </div>

          {/* Signature pour l'impression */}
          <div className="hidden print:flex flex-col items-end mt-8 pr-6">
            <p className="font-black text-black uppercase text-[8px] mb-8">Signature & Cachet du Médecin</p>
            <div className="w-48 h-20 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-100 font-black text-xl select-none">
               CACHET
            </div>
          </div>
        </div>

        {/* CSS pour forcer une seule page et cacher le reste de l'application lors de l'impression */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:block, .print\\:block * {
              visibility: visible;
            }
            .fixed.inset-0 {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              visibility: visible !important;
            }
            .fixed.inset-0 * {
              visibility: visible !important;
            }
            @page {
              size: auto;
              margin: 10mm;
            }
          }
        `}} />

        {/* Footer Modal - Masqué à l'impression */}
        <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/50 print:hidden">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button 
            onClick={() => window.print()}
            className="flex-1 px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3"
          >
            <Printer className="w-5 h-5" />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}
