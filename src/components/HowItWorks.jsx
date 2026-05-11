import "./HowItWorks.css";

const steps = [
  { icon: "🔍", title: "Recherchez", desc: "Entrez votre départ, arrivée et date pour trouver un trajet disponible." },
  { icon: "📋", title: "Réservez", desc: "Choisissez un trajet et envoyez une demande de réservation au conducteur." },
  { icon: "🚗", title: "Voyagez", desc: "Le conducteur accepte votre demande. Voyagez ensemble et partagez les frais." },
];

function HowItWorks() {
  return (
    <section className="hiw">
      <div className="hiw-inner">
        <h2 className="hiw-title">Comment ça marche ?</h2>
        <p className="hiw-sub">Simple, rapide et économique</p>
        <div className="hiw-steps">
          {steps.map((s, i) => (
            <div className="hiw-step" key={i}>
              <div className="step-icon">{s.icon}</div>
              <div className="step-num">Étape {i + 1}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
