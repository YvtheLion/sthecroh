'use client';

export default function DonationThanksPage() {
  return (
    <div className="verify-page">
      <div className="verify-card">
        <a href="/" className="brand" style={{ justifyContent: 'center', marginBottom: 28 }}>
          <span className="brand-mark" style={{ width: 30, height: 30 }} />
          STHECROH
        </a>

        <div className="verify-icon ok">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width={30} height={30}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 8 }}>
          Merci pour votre générosité 🙏
        </h2>
        <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 24 }}>
          Votre don a bien été reçu. Un reçu vous sera envoyé par e-mail. Votre contribution aide
          directement à former la prochaine génération de serviteurs.
        </p>

        <a href="/#dons" className="btn btn-primary btn-block" style={{ display: 'inline-flex' }}>
          Retour à la page des dons
        </a>
      </div>
    </div>
  );
}
