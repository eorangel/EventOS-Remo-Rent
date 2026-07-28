'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cliente = await apiFetch<{ id: string }>('/clientes', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push(`/clientes/${cliente.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
      title="Nuevo cliente"
      description="Registra un cliente en el expediente de Remo&Rent"
      />
      
      <Card className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Nombre *</label>
      <input
      required
      value={form.nombre}
      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      className="w-full"
      />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Empresa</label>
      <input
      value={form.empresa}
      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
      <input
      value={form.telefono}
      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
      className="w-full"
      />
      </div>
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Correo</label>
      <input
      type="email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
      <input
      value={form.direccion}
      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Notas</label>
      <textarea
      rows={3}
      value={form.notas}
      onChange={(e) => setForm({ ...form, notas: e.target.value })}
      className="w-full"
      />
      </div>
      
      {error && (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      
      <div className="flex gap-3">
      <Button type="submit" disabled={loading}>
      {loading ? 'Guardando...' : 'Guardar cliente'}
      </Button>
      <Button type="button" variant="secondary" onClick={() => router.back()}>
      Cancelar
      </Button>
      </div>
      </form>
      </Card>
    </>
  );
}
