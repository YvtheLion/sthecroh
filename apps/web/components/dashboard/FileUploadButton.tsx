'use client';

import { useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { uploadsApi, ApiError } from '../../lib/api';

export function FileUploadButton({
  onUploaded,
  accept,
  label = 'Téléverser un fichier',
}: {
  onUploaded: (url: string) => void;
  accept?: string;
  label?: string;
}) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    setError(null);
    setFileName(file.name);
    try {
      const { url } = await uploadsApi.upload(token, file);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'envoi.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Envoi en cours…' : label}
      </button>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={handleChange} />
      {fileName && !uploading && !error && (
        <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ {fileName}</span>
      )}
      {error && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}
