import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Car, BookOpen, Star, Shield, Settings, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  const quickLinks = [
    {
      to: '/admin',
      icon: Users,
      label: 'Gérer les utilisateurs',
      description: 'Bloquer, débloquer, supprimer des comptes',
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
    },
    {
      to: '/admin',
      icon: Car,
      label: 'Gérer les trajets',
      description: 'Voir et annuler les trajets publiés',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.1)',
    },
    {
      to: '/admin',
      icon: BarChart2,
      label: 'Statistiques',
      description: 'Graphiques et évolution de la plateforme',
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.1)',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* En-tête */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #C1272D, #9e1f24)', boxShadow: '0 4px 20px rgba(193,39,45,0.35)' }}>
          <Shield size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-slate-400 mt-0.5">
            {user?.role === 'superadmin' ? 'Super Administrateur' : 'Administrateur'} — AtlasWay
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Users,    label: 'Utilisateurs', value: stats?.totalUsers,    color: 'bg-blue-600' },
          { icon: Car,      label: 'Trajets',       value: stats?.totalRides,    color: 'bg-green-600' },
          { icon: BookOpen, label: 'Réservations',  value: stats?.totalBookings, color: 'bg-yellow-600' },
          { icon: Star,     label: 'Avis',          value: stats?.totalReviews,  color: 'bg-purple-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{value ?? '—'}</p>
              <p className="text-slate-400 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accès rapides */}
      <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
        <Settings size={18} className="text-slate-400" /> Accès rapides
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {quickLinks.map(({ to, icon: Icon, label, description, color, bg }) => (
          <Link key={label} to={to}
            className="card flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Rappel rôle */}
      <div className="card flex items-start gap-3 border border-yellow-500/20 bg-yellow-500/5">
        <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 text-sm font-semibold">Zone d'administration</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Les actions effectuées ici affectent directement la base de données.
            {user?.role === 'superadmin'
              ? ' En tant que Super Admin, vous avez accès à toutes les actions.'
              : ' Certaines actions nécessitent les droits Super Admin.'}
          </p>
        </div>
      </div>

    </div>
  );
}