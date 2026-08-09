'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type ModalName = 'login' | 'register' | 'demo' | 'cert' | null;

interface UIContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  modal: ModalName;
  openModal: (name: ModalName) => void;
  closeModal: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Le CSS s'appuie sur data-theme au niveau du document, exactement comme le prototype
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <UIContext.Provider
      value={{
        theme,
        toggleTheme,
        modal,
        openModal: setModal,
        closeModal: () => setModal(null),
        toast,
        showToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI doit être utilisé à l’intérieur de <UIProvider>');
  return ctx;
}
