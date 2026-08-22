'use client';

import { UIProvider } from '../lib/ui-context';
import { AuthProvider } from '../lib/auth-context';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { Modals, Toast, TopButton } from './Modals';

/**
 * Enveloppe standard pour toute page secondaire du site public (Mission/Vision/Valeurs,
 * Notre histoire, détail d'une formation/d'un département/d'un événement, etc.) — garantit que
 * Nav et Footer ont bien accès aux contextes dont ils dépendent (connexion, modales).
 */
export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>
        <Nav />
        {children}
        <Footer />
        <Modals />
        <Toast />
        <TopButton />
      </UIProvider>
    </AuthProvider>
  );
}
