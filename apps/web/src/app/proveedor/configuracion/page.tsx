'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';
import { apiFetch } from '@/lib/api';
import { ENTIDADES_FEDERATIVAS } from '@/lib/labels';
import type {
  BriefingPreview,
  HorarioDia,
  PerfilEmpresaResponse,
  RedesSocialesEmpresa,
} from '@/lib/types';

const MONEDAS = ['MXN', 'USD'] as const;

export default function ProveedorConfiguracionPage() {
  const [data, setData] = useState<PerfilEmpresaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [briefingPreview, setBriefingPreview] = useState<BriefingPreview | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingEnviando, setBriefingEnviando] = useState(false);
  const [briefingMensaje, setBriefingMensaje] = useState('');

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
    briefingActivo: true,
    briefingHora: '07:00',
    briefingEmail: '',
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
      briefingActivo: res.perfil.briefingActivo ?? true,
      briefingHora: res.perfil.briefingHora ?? '07:00',
      briefingEmail: res.perfil.briefingEmail?.trim() || res.proveedor.email?.trim() || '',
      horario: res.perfil.horario?.dias ?? [],
      redesSociales: res.perfil.redesSociales ?? {},
    });
  }

  async function cargarBriefingPreview() {
    setBriefingLoading(true);
    setBriefingMensaje('');
    try {
      const preview = await apiFetch<BriefingPreview>('/portal/briefing/hoy');
      setBriefingPreview(preview);
    } catch (err) {
      setBriefingMensaje(err instanceof Error ? err.message : 'No se pudo cargar la vista previa');
    } finally {
      setBriefingLoading(false);
    }
  }

  async function enviarBriefingAhora() {
    setBriefingEnviando(true);
    setBriefingMensaje('');
    try {
      const res = await apiFetch<{ enviadoA: string }>('/portal/briefing/enviar', { method: 'POST' });
      setBriefingMensaje(`Briefing enviado a ${res.enviadoA}`);
      await cargarBriefingPreview();
      await cargar();
    } catch (err) {
      setBriefingMensaje(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setBriefingEnviando(false);
    }
  }

  useEffect(() => {
    cargar()
      .then(() => cargarBriefingPreview())
      .finally(() => setLoading(false));
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
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Resumen matutino</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Recibe por correo un resumen diario de entregas, eventos, cobros y seguimientos.
                  </p>
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.briefingActivo}
                    onChange={(e) => setForm({ ...form, briefingActivo: e.target.checked })}
                  />
                  Envío automático activo
                </label>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Hora de envío</label>
                  <input
                    type="time"
                    value={form.briefingHora}
                    onChange={(e) => setForm({ ...form, briefingHora: e.target.value })}
                    className="w-full text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">Zona horaria: Ciudad de México</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Correo destinatario
                  </label>
                  <input
                    type="email"
                    placeholder="Correo de contacto (Identidad)"
                    value={form.briefingEmail}
                    onChange={(e) => setForm({ ...form, briefingEmail: e.target.value })}
                    className="w-full text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Por defecto usa el correo de Identidad. Puedes cambiarlo si prefieres otro
                    destinatario.
                  </p>
                  {form.email.trim() && form.briefingEmail.trim() !== form.email.trim() && (
                    <button
                      type="button"
                      className="mt-1 text-xs text-teal-700 underline"
                      onClick={() => setForm({ ...form, briefingEmail: form.email.trim() })}
                    >
                      Usar correo de Identidad ({form.email.trim()})
                    </button>
                  )}
                </div>
              </div>

              {briefingPreview && (
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">Vista previa de hoy</span>
                    <Badge className="bg-slate-200 text-slate-700">{briefingPreview.fechaLabel}</Badge>
                    {briefingPreview.vacio && (
                      <Badge className="bg-slate-200 text-slate-600">Sin actividades</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span>{briefingPreview.resumen.entregas} entregas</span>
                    <span>·</span>
                    <span>{briefingPreview.resumen.recogidas} recogidas</span>
                    <span>·</span>
                    <span>{briefingPreview.resumen.eventos} eventos</span>
                    <span>·</span>
                    <span>{briefingPreview.resumen.cobros} cobros hoy</span>
                    <span>·</span>
                    <span>{briefingPreview.resumen.seguimientos} seguimientos</span>
                    {briefingPreview.cobrosVencidos.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-700">
                          {briefingPreview.cobrosVencidos.length} vencidos
                        </span>
                      </>
                    )}
                  </div>
                  <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs text-slate-700">
                    {briefingPreview.texto}
                  </pre>
                  {data?.perfil.briefingUltimoEnvio && (
                    <p className="mt-2 text-xs text-slate-500">
                      Último envío:{' '}
                      {new Intl.DateTimeFormat('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(data.perfil.briefingUltimoEnvio))}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={briefingLoading}
                  onClick={() => void cargarBriefingPreview()}
                >
                  {briefingLoading ? 'Actualizando...' : 'Actualizar vista previa'}
                </Button>
                <Button
                  type="button"
                  disabled={briefingEnviando}
                  onClick={() => void enviarBriefingAhora()}
                >
                  {briefingEnviando ? 'Enviando...' : 'Enviar ahora por correo'}
                </Button>
                {briefingPreview && (
                  <WhatsAppShareButton
                    telefono={form.telefono || form.redesSociales.whatsapp}
                    mensaje={briefingPreview.texto}
                    label="Compartir en WhatsApp"
                    promptLabel="Tu WhatsApp (10 dígitos)"
                  />
                )}
                {briefingMensaje && (
                  <p
                    className={`text-sm ${briefingMensaje.includes('Error') || briefingMensaje.includes('No se') ? 'text-red-600' : 'text-emerald-700'}`}
                  >
                    {briefingMensaje}
                  </p>
                )}
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
