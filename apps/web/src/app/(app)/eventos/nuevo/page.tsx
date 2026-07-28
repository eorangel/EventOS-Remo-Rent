'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { ESTADO_EVENTO_LABELS } from '@/lib/labels';
import type { Cliente, EstadoEvento } from '@/lib/types';

const ESTADOS: EstadoEvento[] = [
  'BORRADOR',
  'COTIZACION',
  'CONFIRMADO',
  'EN_LOGISTICA',
  'EN_EJECUCION',
  'COMPLETADO',
  'CANCELADO',
];

function NuevoEventoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fechaEvento: '',
    fechaMontaje: '',
    fechaDesmontaje: '',
    lugar: '',
    estado: 'BORRADOR' as EstadoEvento,
    notas: '',
    clienteId: searchParams.get('clienteId') ?? '',
  });

  useEffect(() => {
    apiFetch<Cliente[]>('/clientes').then(setClientes);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const evento = await apiFetch<{ id: string }>('/eventos', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push(`/eventos/${evento.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear evento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Título *</label>
      <input
      required
      value={form.titulo}
      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
      className="w-full"
      />
      </div>
      
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Cliente *</label>
      <select
      required
      value={form.clienteId}
      onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
      className="w-full"
      >
      <option value="">Seleccionar cliente</option>
      {clientes.map((cliente) => (
      <option key={cliente.id} value={cliente.id}>
      {cliente.nombre}
      {cliente.empresa ? ` — ${cliente.empresa}` : ''}
      </option>
      ))}
      </select>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-3">
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
      Fecha del evento *
      </label>
      <input
      type="datetime-local"
      required
      value={form.fechaEvento}
      onChange={(e) => setForm({ ...form, fechaEvento: e.target.value })}
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Montaje</label>
      <input
      type="datetime-local"
      value={form.fechaMontaje}
      onChange={(e) => setForm({ ...form, fechaMontaje: e.target.value })}
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Desmontaje</label>
      <input
      type="datetime-local"
      value={form.fechaDesmontaje}
      onChange={(e) => setForm({ ...form, fechaDesmontaje: e.target.value })}
      className="w-full"
      />
      </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Lugar</label>
      <input
      value={form.lugar}
      onChange={(e) => setForm({ ...form, lugar: e.target.value })}
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
      <select
      value={form.estado}
      onChange={(e) =>
      setForm({ ...form, estado: e.target.value as EstadoEvento })
      }
      className="w-full"
      >
      {ESTADOS.map((estado) => (
      <option key={estado} value={estado}>
      {ESTADO_EVENTO_LABELS[estado]}
      </option>
      ))}
      </select>
      </div>
      </div>
      
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
      <textarea
      rows={3}
      value={form.descripcion}
      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
      className="w-full"
      />
      </div>
      
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Notas internas</label>
      <textarea
      rows={2}
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
      {loading ? 'Creando...' : 'Crear evento'}
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

export default function NuevoEventoPage() {
  return (
    <>
      <PageHeader
        title="Nuevo evento"
        description="El evento es el centro del sistema — todo orbita alrededor de él"
      />
      <Suspense fallback={<p className="text-sm text-slate-500">Cargando...</p>}>
        <NuevoEventoForm />
      </Suspense>
    </>
  );
}
