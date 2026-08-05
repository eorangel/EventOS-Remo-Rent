'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { ALCALDIAS_CDMX, ENTIDADES_FEDERATIVAS, ORIGEN_CAPTURA_LABELS, esCiudadDeMexico } from '@/lib/labels';
import type { OrigenCapturaProveedor, TipoProveedor } from '@/lib/types';

export default function NuevoProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    razonSocial: '',
    rfc: '',
    contacto: '',
    email: '',
    telefono: '',
    sitioWeb: '',
    direccion: '',
    ciudad: '',
    entidadFederativa: 'Ciudad de México',
    alcaldia: '',
    tipo: 'SUBARRENDO' as TipoProveedor,
    origenCaptura: 'INTERNO' as OrigenCapturaProveedor,
    eventosSimultaneosMax: '',
    unidadesMaxEntrega: '',
    radioCoberturaKm: '',
    notas: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const proveedor = await apiFetch<{ id: string }>('/proveedores', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          alcaldia: form.alcaldia || undefined,
          eventosSimultaneosMax: form.eventosSimultaneosMax ? Number(form.eventosSimultaneosMax) : undefined,
          unidadesMaxEntrega: form.unidadesMaxEntrega ? Number(form.unidadesMaxEntrega) : undefined,
          radioCoberturaKm: form.radioCoberturaKm ? Number(form.radioCoberturaKm) : undefined,
        }),
      });
      router.push(`/proveedores/${proveedor.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear proveedor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Registrar proveedor"
        description="Captura una nueva empresa para el catálogo nacional de inventario"
      />

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Empresa</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Nombre comercial *</label>
                <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Razón social</label>
                <input value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">RFC</label>
                <input value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value })} className="w-full" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Contacto</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Persona de contacto</label>
                <input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Correo</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sitio web</label>
                <input value={form.sitioWeb} onChange={(e) => setForm({ ...form, sitioWeb: e.target.value })} className="w-full" placeholder="https://..." />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Ubicación</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Dirección</label>
                <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ciudad</label>
                <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Entidad federativa</label>
                <select
                  value={form.entidadFederativa}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      entidadFederativa: e.target.value,
                      alcaldia: esCiudadDeMexico(e.target.value) ? form.alcaldia : '',
                    })
                  }
                  className="w-full"
                >
                  {ENTIDADES_FEDERATIVAS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              {esCiudadDeMexico(form.entidadFederativa) && (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Alcaldía (CDMX)</label>
                  <select
                    value={form.alcaldia}
                    onChange={(e) => setForm({ ...form, alcaldia: e.target.value })}
                    className="w-full"
                  >
                    <option value="">Seleccionar alcaldía...</option>
                    {ALCALDIAS_CDMX.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Capacidad y origen</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Origen de captura</label>
                <select value={form.origenCaptura} onChange={(e) => setForm({ ...form, origenCaptura: e.target.value as OrigenCapturaProveedor })} className="w-full">
                  {(Object.keys(ORIGEN_CAPTURA_LABELS) as OrigenCapturaProveedor[]).map((k) => (
                    <option key={k} value={k}>{ORIGEN_CAPTURA_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Eventos simultáneos (máx.)</label>
                <input type="number" min="0" value={form.eventosSimultaneosMax} onChange={(e) => setForm({ ...form, eventosSimultaneosMax: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Unidades máx. entrega</label>
                <input type="number" min="0" value={form.unidadesMaxEntrega} onChange={(e) => setForm({ ...form, unidadesMaxEntrega: e.target.value })} className="w-full" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Radio cobertura (km)</label>
                <input type="number" min="0" value={form.radioCoberturaKm} onChange={(e) => setForm({ ...form, radioCoberturaKm: e.target.value })} className="w-full" />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notas internas</label>
            <textarea rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="w-full" />
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Registrar y continuar al catálogo'}</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
