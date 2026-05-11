import { useState } from "react";
import "./Header.css";

function Header({ currentUser, onLoginClick, onRegisterClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          <span className="logo-icon">🚗</span>
          <span className="logo-text">
            Blablacar<span className="logo-accent">Maroc</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="nav">
          <a href="#search" className="nav-link">Rechercher un trajet</a>
          <a href="#publish" className="nav-link">Publier un trajet</a>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {currentUser ? (
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="user-avatar">
                  {currentUser.prenom?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="user-name">{currentUser.prenom}</span>
                <span className="chevron">{menuOpen ? "▲" : "▼"}</span>
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <a href="#profile" className="dropdown-item">👤 Mon profil</a>
                  <a href="#rides" className="dropdown-item">🚗 Mes trajets</a>
                  <a href="#bookings" className="dropdown-item">📋 Mes réservations</a>
                  <a href="#messages" className="dropdown-item">💬 Messages</a>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={onLogout}>
                    🚪 Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-outline" onClick={onLoginClick}>
                Connexion
              </button>
              <button className="btn-primary" onClick={onRegisterClick}>
                Inscription
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
