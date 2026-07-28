'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    descripcion: '',
    cantidadTotal: 0,
    costoUnitario: 0,
    precioRenta: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/productos', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      router.push('/inventario');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
      title="Nuevo producto"
      description="Agrega mobiliario al inventario de Remo&Rent"
      />
      
      <Card className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Código *</label>
      <input
      required
      value={form.codigo}
      onChange={(e) => setForm({ ...form, codigo: e.target.value })}
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Categoría</label>
      <input
      value={form.categoria}
      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
      className="w-full"
      placeholder="Mesas, Sillas, Carpas..."
      />
      </div>
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Nombre *</label>
      <input
      required
      value={form.nombre}
      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      className="w-full"
      />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
      Existencias *
      </label>
      <input
      type="number"
      min={0}
      required
      value={form.cantidadTotal}
      onChange={(e) =>
      setForm({ ...form, cantidadTotal: Number(e.target.value) })
      }
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
      Costo unitario
      </label>
      <input
      type="number"
      min={0}
      step="0.01"
      value={form.costoUnitario}
      onChange={(e) =>
      setForm({ ...form, costoUnitario: Number(e.target.value) })
      }
      className="w-full"
      />
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
      Precio renta
      </label>
      <input
      type="number"
      min={0}
      step="0.01"
      value={form.precioRenta}
      onChange={(e) =>
      setForm({ ...form, precioRenta: Number(e.target.value) })
      }
      className="w-full"
      />
      </div>
      </div>
      <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
      <textarea
      rows={2}
      value={form.descripcion}
      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
      className="w-full"
      />
      </div>
      
      {error && (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      
      <div className="flex gap-3">
      <Button type="submit" disabled={loading}>
      {loading ? 'Guardando...' : 'Guardar producto'}
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
