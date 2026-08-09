'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import type { Cliente } from '@/lib/types';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    apiFetch<Cliente[]>(`/clientes${query}`)
      .then(setClientes)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <PageHeader
      title="Clientes"
      description="Expediente único del cliente e historial de eventos"
      action={
      <Link href="/clientes/nuevo">
      <Button>Nuevo cliente</Button>
      </Link>
      }
      />
      
      <div className="mb-6">
      <input
      type="search"
      placeholder="Buscar por nombre, empresa o correo..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-md"
      />
      </div>
      
      {loading ? (
      <p className="text-sm text-slate-500">Cargando clientes...</p>
      ) : clientes.length === 0 ? (
      <EmptyState
      title="Sin clientes"
      description="Registra tu primer cliente para comenzar a crear eventos."
      />
      ) : (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[640px] w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
      <tr>
      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      Cliente
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      Contacto
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      Eventos
      </th>
      <th className="px-6 py-3" />
      </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
      {clientes.map((cliente) => (
      <tr key={cliente.id} className="hover:bg-slate-50">
      <td className="px-6 py-4">
      <p className="font-medium text-slate-900">{cliente.nombre}</p>
      {cliente.empresa && (
      <p className="text-sm text-slate-500">{cliente.empresa}</p>
      )}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
      <p>{cliente.email ?? '—'}</p>
      <p>{cliente.telefono ?? '—'}</p>
      </td>
      <td className="px-6 py-4 text-sm text-slate-900">
      {cliente._count?.eventos ?? 0}
      </td>
      <td className="px-6 py-4 text-right">
      <Link
      href={`/clientes/${cliente.id}`}
      className="text-sm font-medium text-brand-600 hover:underline"
      >
      Ver expediente
      </Link>
      </td>
      </tr>
      ))}
      </tbody>
      </table>
      </div>
      )}
    </>
  );
}
