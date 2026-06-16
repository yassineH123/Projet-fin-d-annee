import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-8xl font-black text-primary-500 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page introuvable</h1>
        <p className="text-slate-400 mb-8">Cette page n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    </div>
  );
}