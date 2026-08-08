'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setStoredUser, setToken } from '@/lib/api';
import { getLoginRedirect } from '@/lib/auth-helpers';
import type { Usuario } from '@/lib/types';
import { Button } from '@/components/ui';
import { RemoLogo } from '@/components/RemoLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<{ accessToken: string; user: Usuario }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(data.accessToken);
      setStoredUser(data.user);
      router.push(getLoginRedirect(data.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <RemoLogo variant="full" priority />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
}
