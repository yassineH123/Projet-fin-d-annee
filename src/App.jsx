import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import AuthModal from "./components/AuthModal";

function App() {
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthModal(null);
  };

  const handleLogout = () => setCurrentUser(null);

  return (
    <div>
      <Header
        currentUser={currentUser}
        onLoginClick={() => setAuthModal("login")}
        onRegisterClick={() => setAuthModal("register")}
        onLogout={handleLogout}
      />
      <Hero onPublishClick={() => setAuthModal(currentUser ? null : "register")} />
      <HowItWorks />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitchMode={(m) => setAuthModal(m)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

export default App;
