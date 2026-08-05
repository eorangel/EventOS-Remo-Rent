'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardAdminInterno } from '@/components/DashboardAdminInterno';
import { Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import type { DashboardResumen } from '@/lib/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiFetch<DashboardResumen>('/dashboard/resumen')
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error de conexión');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <>
      <PageHeader
        title="Inicio"
        description="Métricas internas de la plataforma — salud del negocio Remo&Rent"
        action={
          <div className="flex gap-2">
            <Link
              href="/proveedores"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Proveedores
            </Link>
            <Link
              href="/eventos"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Eventos
            </Link>
          </div>
        }
      />

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-800">No se pudieron cargar las métricas</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <Button type="button" variant="secondary" className="mt-3" onClick={retry}>
            Reintentar
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-80 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-48 rounded-2xl bg-slate-200 lg:col-span-2" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
        </div>
      ) : data ? (
        <DashboardAdminInterno data={data} />
      ) : null}
    </>
  );
}
