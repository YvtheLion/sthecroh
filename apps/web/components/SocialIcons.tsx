export function SocialIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const p = platform.toLowerCase();
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' };

  switch (p) {
    case 'facebook':
      return (
        <svg {...common}>
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <circle cx="12" cy="12" r="4.3" />
          <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M23 12s0-3.4-.43-5.02a2.94 2.94 0 0 0-2.07-2.08C18.9 4.5 12 4.5 12 4.5s-6.9 0-8.5.4A2.94 2.94 0 0 0 1.43 6.98C1 8.6 1 12 1 12s0 3.4.43 5.02a2.94 2.94 0 0 0 2.07 2.08c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.94 2.94 0 0 0 2.07-2.08C23 15.4 23 12 23 12z" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.8 15.2V8.8l6 3.2-6 3.2z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common}>
          <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="7.2" cy="8" r="1.4" />
          <path d="M6 11h2.4v7H6z" />
          <path d="M11 11h2.3v1.1c.5-.8 1.3-1.3 2.4-1.3 2 0 2.8 1.3 2.8 3.3V18h-2.4v-3.4c0-.9-.3-1.6-1.2-1.6-.9 0-1.5.6-1.5 1.6V18H11z" />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg {...common}>
          <path d="M18.2 3h3l-6.6 7.5L22.5 21h-6.1l-4.8-6.3L5.9 21H3l7-8-7.2-10h6.3l4.4 5.8L18.2 3z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...common}>
          <path d="M14.5 2h2.7c.2 1.6 1.2 3 2.7 3.7v2.7c-1.4 0-2.7-.4-3.8-1.2v7.1c0 3-2.4 5.4-5.4 5.4S5.3 17.3 5.3 14.3c0-2.9 2.2-5.2 5.1-5.4v2.8c-1.3.2-2.3 1.3-2.3 2.6 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7V2z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.5-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 20.2 12 8.2 8.2 0 0 1 12 20.2z" />
          <path d="M16.6 14c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.3.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.7-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z" />
        </svg>
      );
    default:
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
