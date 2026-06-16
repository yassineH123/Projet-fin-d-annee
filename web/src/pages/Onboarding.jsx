import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Camera, ArrowRight, ArrowLeft, CheckCircle, MapPin, Shield, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STEPS = { CHOICE: 'choice', DRIVER_INFO: 'driver_info', DRIVER_CAR: 'driver_car' };

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step,        setStep]        = useState(STEPS.CHOICE);
  const [choice,      setChoice]      = useState(null); // 'passenger' | 'driver'
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', licensePlate: '' });
  const [photoFile,   setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [carFile,     setCarFile]     = useState(null);
  const [carPreview,  setCarPreview]  = useState(null);

  const photoRef = useRef();
  const carRef   = useRef();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'photo') { setPhotoFile(file); setPhotoPreview(url); }
    else                  { setCarFile(file);   setCarPreview(url);   }
  };

  const handleSubmit = async () => {
    if (choice === 'driver') {
      if (!form.firstName.trim() || !form.lastName.trim()) { toast.error('Prénom et nom requis.'); return; }
      if (!form.licensePlate.trim()) { toast.error('Numéro de plaque requis.'); return; }
      if (!carFile) { toast.error('Photo de voiture requise.'); return; }
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('type', choice);
      fd.append('firstName', form.firstName);
      fd.append('lastName',  form.lastName);
      if (form.licensePlate) fd.append('licensePlate', form.licensePlate);
      if (photoFile) fd.append('photo', photoFile);
      if (carFile)   fd.append('carPhoto', carFile);

      const { data } = await api.put('/users/onboarding', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success(choice === 'driver' ? 'Bienvenue conducteur !' : 'Bienvenue sur AtlasWay !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-center py-8 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <Car className="text-primary-400" size={22} />
          </div>
          <span className="font-black text-2xl">
            <span className="text-white">Atlas</span><span className="text-primary-400">Way</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* ─── STEP 1: CHOICE ─── */}
        {step === STEPS.CHOICE && (
          <div className="w-full max-w-3xl">
            {/* Welcome */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-6">
                <CheckCircle size={16} className="text-primary-400" />
                <span className="text-primary-400 text-sm font-semibold">Compte créé avec succès</span>
              </div>
              <h1 className="text-4xl font-black text-white mb-4">
                Bienvenue, {user?.firstName} !
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                AtlasWay connecte les voyageurs à travers tout le Maroc. Comment voulez-vous utiliser la plateforme ?
              </p>
            </div>

            {/* Trust stats */}
            <div className="flex justify-center gap-8 mb-10">
              {[['12 000+', 'Voyageurs'],['45+', 'Villes'],['4.8/5', 'Note moyenne']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black text-primary-400">{val}</p>
                  <p className="text-slate-500 text-sm">{label}</p>
                </div>
              ))}
            </div>

            {/* Choice cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Passager */}
              <button
                onClick={() => setChoice('passenger')}
                className={`group p-8 rounded-2xl border-2 text-left transition-all duration-200 ${
                  choice === 'passenger'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-500 bg-dark-800 hover:border-primary-500/50 hover:bg-dark-700'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${choice === 'passenger' ? 'bg-primary-500' : 'bg-dark-600 group-hover:bg-dark-500'}`}>
                  <Users size={26} className="text-white" />
                </div>
                <h2 className="text-xl font-black text-white mb-2">Je suis voyageur</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Je veux trouver des trajets, réserver des places et voyager à moindre coût à travers le Maroc.
                </p>
                <ul className="space-y-2">
                  {['Rechercher des trajets', 'Réserver en un clic', 'Communiquer avec le conducteur'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-slate-400 text-xs">
                      <CheckCircle size={13} className="text-primary-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {choice === 'passenger' && (
                  <div className="mt-4 flex items-center gap-1.5 text-primary-400 text-sm font-semibold">
                    <CheckCircle size={16} /> Sélectionné
                  </div>
                )}
              </button>

              {/* Conducteur */}
              <button
                onClick={() => setChoice('driver')}
                className={`group p-8 rounded-2xl border-2 text-left transition-all duration-200 ${
                  choice === 'driver'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-dark-500 bg-dark-800 hover:border-green-500/50 hover:bg-dark-700'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${choice === 'driver' ? 'bg-green-500' : 'bg-dark-600 group-hover:bg-dark-500'}`}>
                  <Car size={26} className="text-white" />
                </div>
                <h2 className="text-xl font-black text-white mb-2">Je suis conducteur</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Je veux proposer mes trajets, transporter des passagers et couvrir mes frais de route.
                </p>
                <ul className="space-y-2">
                  {['Publier vos trajets', 'Choisir vos passagers', 'Économiser sur l\'essence'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-slate-400 text-xs">
                      <CheckCircle size={13} className="text-green-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {choice === 'driver' && (
                  <div className="mt-4 flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                    <CheckCircle size={16} /> Sélectionné
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (!choice) { toast.error('Choisissez un profil.'); return; }
                  if (choice === 'passenger') handleSubmit();
                  else setStep(STEPS.DRIVER_INFO);
                }}
                disabled={!choice || saving}
                className="btn-primary px-10 py-3.5 text-base font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Continuer'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: DRIVER INFO ─── */}
        {step === STEPS.DRIVER_INFO && (
          <div className="w-full max-w-md">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-1.5 bg-green-500 rounded-full" />
              <div className="flex-1 h-1.5 bg-dark-600 rounded-full" />
              <span className="text-slate-500 text-xs ml-1">Étape 1 / 2</span>
            </div>

            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield size={26} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Votre profil conducteur</h2>
              <p className="text-slate-400 text-sm">Ces informations rassureront vos futurs passagers.</p>
            </div>

            <div className="card flex flex-col gap-5">
              {/* Photo de profil */}
              <div className="flex flex-col items-center gap-3">
                <div
                  onClick={() => photoRef.current.click()}
                  className="relative w-24 h-24 rounded-full cursor-pointer group"
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="" className="w-24 h-24 rounded-full object-cover ring-2 ring-green-500" />
                    : <div className="w-24 h-24 rounded-full bg-dark-600 border-2 border-dashed border-dark-400 flex flex-col items-center justify-center group-hover:border-green-500 transition">
                        <Camera size={22} className="text-slate-500 group-hover:text-green-400 transition" />
                        <span className="text-[10px] text-slate-500 mt-1">Photo</span>
                      </div>
                  }
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-dark-800">
                    <Camera size={13} className="text-white" />
                  </div>
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'photo')} />
                <p className="text-slate-500 text-xs">Photo de profil (optionnelle)</p>
              </div>

              {/* Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Prénom</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Nom</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(STEPS.CHOICE)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Retour
                </button>
                <button
                  onClick={() => {
                    if (!form.firstName.trim() || !form.lastName.trim()) { toast.error('Remplissez votre nom.'); return; }
                    setStep(STEPS.DRIVER_CAR);
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                >
                  Suivant <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: DRIVER CAR ─── */}
        {step === STEPS.DRIVER_CAR && (
          <div className="w-full max-w-md">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-1.5 bg-green-500 rounded-full" />
              <div className="flex-1 h-1.5 bg-green-500 rounded-full" />
              <span className="text-slate-500 text-xs ml-1">Étape 2 / 2</span>
            </div>

            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Car size={26} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Votre véhicule</h2>
              <p className="text-slate-400 text-sm">Les passagers verront ces informations avant de réserver.</p>
            </div>

            <div className="card flex flex-col gap-5">
              {/* Photo voiture */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Photo du véhicule</label>
                <div
                  onClick={() => carRef.current.click()}
                  className={`relative w-full h-44 rounded-xl cursor-pointer border-2 border-dashed overflow-hidden transition group ${
                    carPreview ? 'border-green-500' : 'border-dark-400 hover:border-green-500 bg-dark-700'
                  }`}
                >
                  {carPreview
                    ? <img src={carPreview} alt="" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Camera size={32} className="text-slate-500 group-hover:text-green-400 transition" />
                        <p className="text-slate-500 text-sm">Cliquez pour ajouter une photo</p>
                        <p className="text-slate-600 text-xs">JPG, PNG · max 3 Mo</p>
                      </div>
                  }
                  {carPreview && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">Changer la photo</span>
                    </div>
                  )}
                </div>
                <input ref={carRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'car')} />
              </div>

              {/* Plaque */}
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Numéro de plaque d'immatriculation</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    value={form.licensePlate}
                    onChange={(e) => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })}
                    placeholder="Ex : 12345-A-1"
                    className="input pl-9 font-mono tracking-wider"
                    required
                  />
                </div>
                <p className="text-slate-600 text-xs mt-1">Format marocain : 12345-A-1</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(STEPS.DRIVER_INFO)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                >
                  {saving ? 'Enregistrement...' : <><CheckCircle size={16} /> Terminer</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}