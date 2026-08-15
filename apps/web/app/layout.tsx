import type { Metadata } from 'next';
import '../styles/globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TITLE = 'STHECROH — Séminaire Théologique | Plateforme LMS';
const DESCRIPTION =
  "STHECROH réunit cours en ligne, suivi pédagogique, certification vérifiable et administration dans une seule plateforme pensée pour les séminaires théologiques francophones.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | STHECROH',
  },
  description: DESCRIPTION,
  keywords: [
    'séminaire théologique',
    'formation théologique en ligne',
    'LMS francophone',
    'théologie systématique',
    'certificat théologique',
    'école biblique en ligne',
  ],
  authors: [{ name: 'STHECROH' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'STHECROH',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'STHECROH — Séminaire Théologique' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
