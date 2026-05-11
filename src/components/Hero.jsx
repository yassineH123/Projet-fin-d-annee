import { useState } from "react";
import "./Hero.css";

function Hero({ onPublishClick }) {
  const [from, setFrom]   = useState("");
  const [to, setTo]       = useState("");
  const [date, setDate]   = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Recherche : ${from} → ${to} le ${date}`);
  };

  return (
    <main className="hero">
      {/* Fond coloré style BlaBlaCar */}
      <div className="hero-bg">
        <div className="hero-wave" />
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          Voyagez en covoiturage<br />
          <span className="hero-title-highlight">partout au Maroc</span>
        </h1>
        <p className="hero-subtitle">
          Trouvez ou proposez un trajet entre Casablanca, Rabat, Marrakech, Fès et plus de 50 villes.
        </p>

        {/* Barre de recherche — US5 */}
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-field">
            <span className="sfield-icon">📍</span>
            <div className="sfield-body">
              <label className="sfield-label">Départ</label>
              <input
                type="text"
                placeholder="Ville de départ"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="sfield-input"
                required
              />
            </div>
          </div>

          <div className="search-sep" />

          <div className="search-field">
            <span className="sfield-icon">🏁</span>
            <div className="sfield-body">
              <label className="sfield-label">Arrivée</label>
              <input
                type="text"
                placeholder="Ville d'arrivée"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="sfield-input"
                required
              />
            </div>
          </div>

          <div className="search-sep" />

          <div className="search-field">
            <span className="sfield-icon">📅</span>
            <div className="sfield-body">
              <label className="sfield-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="sfield-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="search-btn">
            Rechercher
          </button>
        </form>

        {/* CTA publier */}
        <div className="hero-cta">
          <span className="hero-cta-text">Vous conduisez ?</span>
          <button className="cta-publish" onClick={onPublishClick}>
            Publiez votre trajet →
          </button>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="stat">
            <strong>12 000+</strong>
            <span>Trajets publiés</span>
          </div>
          <div className="stat-dot" />
          <div className="stat">
            <strong>45 000+</strong>
            <span>Membres</span>
          </div>
          <div className="stat-dot" />
          <div className="stat">
            <strong>50+</strong>
            <span>Villes</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Hero;
