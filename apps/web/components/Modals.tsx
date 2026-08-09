'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '../lib/ui-context';
import { useAuth, ApiError } from '../lib/auth-context';

export function Modals() {
  const { modal, closeModal, openModal, showToast } = useUI();
  const { login, register } = useAuth();
  const router = useRouter();

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [demoLoading, setDemoLoading] = useState(false);

  const resetLoginState = () => {
    setLoginError(null);
    setNeeds2FA(false);
    setTwoFactorCode('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const result = await login(loginEmail, loginPassword, needs2FA ? twoFactorCode : undefined);
      if (result.requiresTwoFactor) {
        setNeeds2FA(true);
        setLoginLoading(false);
        return;
      }
      closeModal();
      resetLoginState();
      showToast('Connexion réussie — redirection vers votre espace…');
      router.push('/dashboard');
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'Erreur inattendue. Réessayez.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    setRegisterLoading(true);
    setRegisterError(null);
    try {
      await register({
        firstName: String(data.get('firstName')),
        lastName: String(data.get('lastName')),
        email: String(data.get('email')),
        password: String(data.get('password')),
      });
      closeModal();
      showToast('Compte créé — redirection vers votre espace…');
      router.push('/dashboard');
    } catch (err) {
      setRegisterError(
        err instanceof ApiError ? err.message : "Impossible de créer le compte. Réessayez.",
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDemo = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoLoading(true);
    setTimeout(() => {
      setDemoLoading(false);
      closeModal();
      showToast('Demande envoyée — nous vous recontacterons sous 24h');
    }, 1100);
  };

  return (
    <>
      {/* ---------- LOGIN ---------- */}
      <div
        className={`modal-overlay${modal === 'login' ? ' show' : ''}`}
        onClick={() => {
          closeModal();
          resetLoginState();
        }}
      >
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button
            className="modal-close"
            onClick={() => {
              closeModal();
              resetLoginState();
            }}
          >
            ✕
          </button>
          <h3>Bon retour</h3>
          <p className="sub">Connectez-vous à votre espace STHECROH.</p>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Adresse e-mail</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="vous@sthecroh.edu"
              />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {needs2FA && (
              <div className="field">
                <label>Code de double authentification</label>
                <input
                  type="text"
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
            )}
            {loginError && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{loginError}</p>
            )}
            <button className="btn btn-primary btn-block" type="submit" disabled={loginLoading}>
              {loginLoading ? 'Connexion…' : needs2FA ? 'Vérifier le code' : 'Se connecter'}
            </button>
          </form>
          <p className="modal-foot">
            Pas encore de compte ?{' '}
            <a
              href="#"
              style={{ color: 'var(--royal-2)', fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                resetLoginState();
                openModal('register');
              }}
            >
              Créer un compte
            </a>
          </p>
        </div>
      </div>

      {/* ---------- REGISTER ---------- */}
      <div className={`modal-overlay${modal === 'register' ? ' show' : ''}`} onClick={closeModal}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>
            ✕
          </button>
          <h3>Créer votre compte</h3>
          <p className="sub">Rejoignez STHECROH en quelques secondes.</p>
          <form onSubmit={handleRegister}>
            <div className="field-row">
              <div className="field">
                <label>Prénom</label>
                <input name="firstName" required placeholder="Jean-Baptiste" />
              </div>
              <div className="field">
                <label>Nom</label>
                <input name="lastName" required placeholder="Nkurunziza" />
              </div>
            </div>
            <div className="field">
              <label>Adresse e-mail</label>
              <input name="email" type="email" required placeholder="vous@exemple.com" />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input name="password" type="password" required minLength={10} placeholder="10 caractères minimum" />
            </div>
            {registerError && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{registerError}</p>
            )}
            <button className="btn btn-primary btn-block" type="submit" disabled={registerLoading}>
              {registerLoading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>
          <p className="modal-foot">
            Vous représentez une institution ?{' '}
            <a
              href="#"
              style={{ color: 'var(--royal-2)', fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                openModal('demo');
              }}
            >
              Demandez une démo
            </a>
          </p>
        </div>
      </div>

      {/* ---------- DEMO REQUEST ---------- */}
      <div className={`modal-overlay${modal === 'demo' ? ' show' : ''}`} onClick={closeModal}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>
            ✕
          </button>
          <h3>Demander une démo</h3>
          <p className="sub">Un conseiller STHECROH vous contactera sous 24h.</p>
          <form onSubmit={handleDemo}>
            <div className="field">
              <label>Nom de l&rsquo;institution</label>
              <input type="text" required placeholder="Ex. Église Renaissance" />
            </div>
            <div className="field">
              <label>Adresse e-mail</label>
              <input type="email" required placeholder="vous@exemple.com" />
            </div>
            <button className="btn btn-gold btn-block" type="submit" disabled={demoLoading}>
              {demoLoading ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function Toast() {
  const { toast } = useUI();
  return (
    <div className={`toast${toast ? ' show' : ''}`} id="toast">
      <span className="dot-ok" />
      <span id="toastMsg">{toast ?? 'Connexion réussie'}</span>
    </div>
  );
}

export function TopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`top-btn${show ? ' show' : ''}`}
      aria-label="Retour en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
