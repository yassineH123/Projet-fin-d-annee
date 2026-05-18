import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Car className="text-primary-400" size={15} />
            </div>
            <span className="font-black text-lg">
              <span className="text-white">Atlas</span><span className="text-primary-400">Way</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link to="/rides/search" className="hover:text-white transition-colors">Rechercher</Link>
            <Link to="/rides/publish" className="hover:text-white transition-colors">Publier un trajet</Link>
            <Link to="/register" className="hover:text-white transition-colors">S'inscrire</Link>
          </div>

          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} AtlasWay · Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}
