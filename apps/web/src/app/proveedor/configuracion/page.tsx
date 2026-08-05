'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { ENTIDADES_FEDERATIVAS } from '@/lib/labels';
import type { HorarioDia, PerfilEmpresaResponse, RedesSocialesEmpresa } from '@/lib/types';

const MONEDAS = ['MXN', 'USD'] as const;

export default function ProveedorConfiguracionPage() {
  const [data, setData] = useState<PerfilEmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    razonSocial: '',
    rfc: '',
    regimenFiscal: '',
    codigoPostal: '',
    email: '',
    telefono: '',
    contacto: '',
    direccion: '',
    ciudad: '',
    entidadFederativa: '',
    logoUrl: '',
    politicasRenta: '',
    condicionesCancelacion: '',
    ivaIncluido: false,
    moneda: 'MXN',
    horario: [] as HorarioDia[],
    redesSociales: {} as RedesSocialesEmpresa,
  });

  async function cargar() {
    const res = await apiFetch<PerfilEmpresaResponse>('/portal/empresa');
    setData(res);
    setForm({
      nombre: res.proveedor.nombre ?? '',
      razonSocial: res.proveedor.razonSocial ?? '',
      rfc: res.proveedor.rfc ?? '',
      regimenFiscal: res.perfil.regimenFiscal ?? '',
      codigoPostal: res.perfil.codigoPostal ?? '',
      email: res.proveedor.email ?? '',
      telefono: res.proveedor.telefono ?? '',
      contacto: res.proveedor.contacto ?? '',
      direccion: res.proveedor.direccion ?? '',
      ciudad: res.proveedor.ciudad ?? '',
      entidadFederativa: res.proveedor.entidadFederativa ?? '',
      logoUrl: res.perfil.logoUrl ?? '',
      politicasRenta: res.perfil.politicasRenta ?? '',
      condicionesCancelacion: res.perfil.condicionesCancelacion ?? '',
      ivaIncluido: res.perfil.ivaIncluido,
      moneda: res.perfil.moneda,
      horario: res.perfil.horario?.dias ?? [],
      redesSociales: res.perfil.redesSociales ?? {},
    });
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, []);

  function updateHorario(index: number, field: keyof HorarioDia, value: string | boolean) {
    setForm((prev) => {
      const dias = [...prev.horario];
      dias[index] = { ...dias[index], [field]: value };
      return { ...prev, horario: dias };
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMensaje('');
    try {
      await apiFetch('/portal/empresa', {
        method: 'PATCH',
        body: JSON.stringify({
          ...form,
          horario: { dias: form.horario },
        }),
      });
      setMensaje('Perfil de empresa guardado correctamente.');
      await cargar();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Configuración de la empresa"
        description="Perfil público y datos fiscales — visible para el equipo Remo&Rent"
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando configuración...</p>
      ) : data ? (
        <form onSubmit={guardar} className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Completitud del perfil</h2>
                <p className="text-sm text-slate-500">
                  Un perfil completo ayuda a Remo&Rent a conocerte mejor y generar más confianza.
                </p>
              </div>
              <div className="min-w-[180px]">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-500">Progreso</span>
                  <span className="font-semibold text-teal-700">{data.completitudPerfilEmpresa}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${data.completitudPerfilEmpresa}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 text-lg font-semibold">Identidad</h2>
              <div className="space-y-3">
                <input
                  required
                  placeholder="Nombre comercial *"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full text-sm"
                />
                <input
                  placeholder="URL del logo"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="w-full text-sm"
                />
                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="h-16 w-16 rounded-lg border object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <input
                  placeholder="Persona de contacto"
                  value={form.contacto}
                  onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                  className="w-full text-sm"
                />
                <input
                  type="email"
                  placeholder="Correo de contacto"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full text-sm"
                />
                <input
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full text-sm"
                />
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold">Datos fiscales</h2>
              <div className="space-y-3">
                <input
                  placeholder="Razón social"
                  value={form.razonSocial}
                  onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                  className="w-full text-sm"
                />
                <input
                  placeholder="RFC"
                  value={form.rfc}
                  onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                  className="w-full text-sm"
                />
                <input
                  placeholder="Régimen fiscal"
                  value={form.regimenFiscal}
                  onChange={(e) => setForm({ ...form, regimenFiscal: e.target.value })}
                  className="w-full text-sm"
                />
                <input
                  placeholder="Código postal"
                  value={form.codigoPostal}
                  onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                  className="w-full text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={form.moneda}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                    className="w-full text-sm"
                  >
                    {MONEDAS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.ivaIncluido}
                      onChange={(e) => setForm({ ...form, ivaIncluido: e.target.checked })}
                    />
                    IVA incluido en precios
                  </label>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold">Dirección</h2>
              <div className="space-y-3">
                <input
                  placeholder="Calle y número"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="w-full text-sm"
                />
                <input
                  placeholder="Ciudad"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  className="w-full text-sm"
                />
                <select
                  value={form.entidadFederativa}
                  onChange={(e) => setForm({ ...form, entidadFederativa: e.target.value })}
                  className="w-full text-sm"
                >
                  <option value="">Entidad federativa</option>
                  {ENTIDADES_FEDERATIVAS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold">Redes sociales</h2>
              <div className="space-y-3">
                {(['facebook', 'instagram', 'whatsapp', 'tiktok', 'linkedin', 'sitioWeb'] as const).map(
                  (red) => (
                    <input
                      key={red}
                      placeholder={red === 'sitioWeb' ? 'Sitio web' : red.charAt(0).toUpperCase() + red.slice(1)}
                      value={form.redesSociales[red] ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          redesSociales: { ...form.redesSociales, [red]: e.target.value },
                        })
                      }
                      className="w-full text-sm"
                    />
                  ),
                )}
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Horario de atención</h2>
              <div className="space-y-2">
                {form.horario.map((dia, index) => (
                  <div
                    key={dia.dia}
                    className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{dia.dia}</span>
                    <input
                      type="time"
                      disabled={dia.cerrado}
                      value={dia.abre ?? ''}
                      onChange={(e) => updateHorario(index, 'abre', e.target.value)}
                      className="text-sm"
                    />
                    <input
                      type="time"
                      disabled={dia.cerrado}
                      value={dia.cierra ?? ''}
                      onChange={(e) => updateHorario(index, 'cierra', e.target.value)}
                      className="text-sm"
                    />
                    <label className="flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={!!dia.cerrado}
                        onChange={(e) => updateHorario(index, 'cerrado', e.target.checked)}
                      />
                      Cerrado
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Políticas comerciales</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Políticas de renta
                  </label>
                  <textarea
                    rows={5}
                    value={form.politicasRenta}
                    onChange={(e) => setForm({ ...form, politicasRenta: e.target.value })}
                    placeholder="Anticipo, montaje, mínimos de renta..."
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Condiciones de cancelación
                  </label>
                  <textarea
                    rows={5}
                    value={form.condicionesCancelacion}
                    onChange={(e) => setForm({ ...form, condicionesCancelacion: e.target.value })}
                    placeholder="Plazos, penalizaciones, reembolsos..."
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </Button>
            {mensaje && (
              <p className={`text-sm ${mensaje.includes('Error') ? 'text-red-600' : 'text-emerald-700'}`}>
                {mensaje}
              </p>
            )}
          </div>
        </form>
      ) : null}
    </>
  );
}
