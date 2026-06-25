import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-primary-900/40 mt-auto">
      {/* Bande ornementale zellige */}
      <div className="h-1 bg-gradient-to-r from-primary-700 via-gold-500 to-morocco-600" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-800/40 flex items-center justify-center">
              <Car className="text-primary-400" size={15} />
            </div>
            <span className="font-black text-lg font-heading">
              <span style={{ color: 'var(--text-base)' }}>Atlas</span><span className="logo-gradient">Way</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-amber-200/40">
            <Link to="/rides/search"  className="hover:text-amber-100 transition-colors">Rechercher</Link>
            <Link to="/rides/publish" className="hover:text-amber-100 transition-colors">Publier un trajet</Link>
            <Link to="/register"      className="hover:text-amber-100 transition-colors">S'inscrire</Link>
          </div>

          <p className="text-amber-200/25 text-xs">
            © {new Date().getFullYear()} AtlasWay · 🇲🇦 Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}
