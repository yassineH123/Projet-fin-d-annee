import { useState } from "react";
import "./AuthModal.css";

// Validation
const isValidEmail    = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPassword = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);

// Étapes d'inscription : 'form' | 'verify'
function AuthModal({ mode, onClose, onSwitchMode, onLogin }) {
  const [step, setStep]         = useState("form");   // étape inscription
  const [form, setForm]         = useState({ prenom: "", nom: "", email: "", password: "", confirmPassword: "" });
  const [code, setCode]         = useState("");        // code saisi par l'utilisateur
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const update = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setApiError("");
  };

  // ───────────────────────────────────────────────
  // INSCRIPTION — étape 1 : envoi du formulaire
  // ───────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.prenom.trim())          errs.prenom = "Prénom requis.";
    if (!form.nom.trim())             errs.nom    = "Nom requis.";
    if (!isValidEmail(form.email))    errs.email  = "Email invalide.";
    if (!isValidPassword(form.password))
      errs.password = "Min 8 caractères, 1 majuscule, 1 chiffre.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas.";

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom:   form.prenom,
          nom:      form.nom,
          email:    form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || "Erreur serveur."); return; }

      // Passe à l'étape de vérification
      setStep("verify");
    } catch {
      setApiError("Impossible de contacter le serveur. Vérifiez qu'il est lancé.");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────
  // INSCRIPTION — étape 2 : vérification du code
  // ───────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { setApiError("Le code doit contenir 6 chiffres."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || "Code invalide."); return; }

      onLogin({ prenom: form.prenom, email: form.email });
    } catch {
      setApiError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code
  const handleResend = async () => {
    setResendMsg("");
    setApiError("");
    try {
      await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      setResendMsg("Nouveau code envoyé !");
    } catch {
      setApiError("Erreur lors du renvoi.");
    }
  };

  // ───────────────────────────────────────────────
  // CONNEXION
  // ───────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isValidEmail(form.email))  errs.email    = "Email invalide.";
    if (!form.password)             errs.password = "Mot de passe requis.";
    if (Object.keys(errs).length)   { setErrors(errs); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.message || "Email ou mot de passe incorrect."); return; }

      onLogin({ prenom: data.prenom, email: data.email });
    } catch {
      setApiError("Impossible de contacter le serveur. Vérifiez qu'il est lancé.");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  // Force du mot de passe
  const pwdStrength = () => {
    if (!form.password) return null;
    if (isValidPassword(form.password)) return { level: "Fort",  cls: "strong" };
    if (form.password.length >= 6)      return { level: "Moyen", cls: "medium" };
    return                                     { level: "Faible", cls: "weak" };
  };
  const strength = pwdStrength();

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>

        {/* ── ÉTAPE VÉRIFICATION EMAIL ── */}
        {!isLogin && step === "verify" ? (
          <>
            <div className="modal-head">
              <div className="verify-icon">📧</div>
              <h2 className="modal-title">Vérifiez votre email</h2>
              <p className="modal-sub">
                Un code à 6 chiffres a été envoyé à<br />
                <strong>{form.email}</strong>
              </p>
            </div>

            {apiError  && <div className="alert alert-error">{apiError}</div>}
            {resendMsg && <div className="alert alert-success">{resendMsg}</div>}

            <form className="modal-form" onSubmit={handleVerify} noValidate>
              <div className="form-group">
                <label>Code de vérification</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="_ _ _ _ _ _"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setApiError(""); }}
                  className="input-code"
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <span className="spinner" /> : "Confirmer mon compte"}
              </button>
            </form>

            <p className="modal-switch">
              Pas reçu le code ?{" "}
              <button className="switch-link" onClick={handleResend}>Renvoyer</button>
            </p>
          </>
        ) : (
          <>
            {/* ── FORMULAIRE PRINCIPAL ── */}
            <div className="modal-head">
              <h2 className="modal-title">
                {isLogin ? "Connexion" : "Créer un compte"}
              </h2>
              <p className="modal-sub">
                {isLogin
                  ? "Accédez à votre espace BlablacarMaroc"
                  : "Rejoignez la communauté BlablacarMaroc"}
              </p>
            </div>

            {apiError && <div className="alert alert-error">{apiError}</div>}

            <form
              className="modal-form"
              onSubmit={isLogin ? handleLogin : handleRegister}
              noValidate
            >
              {/* Prénom / Nom — inscription uniquement */}
              {!isLogin && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      placeholder="Mohammed"
                      value={form.prenom}
                      onChange={(e) => update("prenom", e.target.value)}
                      className={errors.prenom ? "input-err" : ""}
                    />
                    {errors.prenom && <span className="ferr">{errors.prenom}</span>}
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      placeholder="Alami"
                      value={form.nom}
                      onChange={(e) => update("nom", e.target.value)}
                      className={errors.nom ? "input-err" : ""}
                    />
                    {errors.nom && <span className="ferr">{errors.nom}</span>}
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label>Adresse email</label>
                <input
                  type="email"
                  placeholder="exemple@gmail.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={errors.email ? "input-err" : ""}
                />
                {errors.email && <span className="ferr">{errors.email}</span>}
              </div>

              {/* Mot de passe */}
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder={isLogin ? "Votre mot de passe" : "Min 8 car. + 1 maj + 1 chiffre"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className={errors.password ? "input-err" : ""}
                />
                {errors.password && <span className="ferr">{errors.password}</span>}
                {!isLogin && strength && (
                  <div className="pwd-row">
                    <div className={`pwd-bar ${strength.cls}`} />
                    <span className="pwd-lbl">{strength.level}</span>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              {!isLogin && (
                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    placeholder="Répétez le mot de passe"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "input-err" : ""}
                  />
                  {errors.confirmPassword && <span className="ferr">{errors.confirmPassword}</span>}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? <span className="spinner" /> : isLogin ? "Se connecter" : "Créer mon compte"}
              </button>
            </form>

            <p className="modal-switch">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
              <button
                className="switch-link"
                onClick={() => { onSwitchMode(isLogin ? "register" : "login"); setApiError(""); setErrors({}); }}
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
