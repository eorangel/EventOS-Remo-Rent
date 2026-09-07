'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContratoPreview } from '@/components/ContratoPreview';
import { Badge, Button, Card } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  VARIABLES_CONTRATO_AYUDA,
  abrirPdfHtml,
  nuevaSeccionContrato,
  pdfVarsToVariables,
  seccionesSugeridas,
} from '@/lib/contrato-proveedor';
import {
  ESTADO_PLANTILLA_CONTRATO_COLORS,
  ESTADO_PLANTILLA_CONTRATO_LABELS,
  TIPO_SERVICIO_CONTRATO_LABELS,
} from '@/lib/labels';
import type {
  ContratoEmitidoProveedor,
  ContratoPdfResponse,
  EnviarContratoEmailResponse,
  EstadoPlantillaContrato,
  MenuBanqueteProveedor,
  PerfilEmpresaResponse,
  PlantillaContratoProveedor,
  SeccionContrato,
  ServicioProveedor,
  TipoServicioContrato,
} from '@/lib/types';

type Props = {
  mode: 'create' | 'edit';
  plantillaId?: string;
  initialData?: PlantillaContratoProveedor;
  initialEmitidoId?: string;
};

type PdfVars = {
  clienteNombre: string;
  clienteEmpresa: string;
  clienteEmail: string;
  clienteTelefono: string;
  fechaEvento: string;
  lugarEvento: string;
  montoTotal: string;
  servicioNombre: string;
};

const pdfVarsIniciales: PdfVars = {
  clienteNombre: '',
  clienteEmpresa: '',
  clienteEmail: '',
  clienteTelefono: '',
  fechaEvento: '',
  lugarEvento: '',
  montoTotal: '',
  servicioNombre: '',
};

const DATOS_CLIENTE_FIELDS: Array<{ key: keyof PdfVars; label: string; placeholder: string }> = [
  { key: 'clienteNombre', label: 'Nombre del cliente', placeholder: 'María González' },
  { key: 'clienteEmpresa', label: 'Empresa', placeholder: 'Opcional' },
  { key: 'clienteEmail', label: 'Email', placeholder: 'cliente@ejemplo.com' },
  { key: 'clienteTelefono', label: 'Teléfono', placeholder: '55 1234 5678' },
  { key: 'fechaEvento', label: 'Fecha del evento', placeholder: '15 de marzo de 2026' },
  { key: 'lugarEvento', label: 'Lugar del evento', placeholder: 'Salón Las Flores, CDMX' },
  { key: 'montoTotal', label: 'Monto total', placeholder: '$25,000.00 MXN' },
  { key: 'servicioNombre', label: 'Nombre del servicio', placeholder: 'Renta de mobiliario' },
];

export function ContratoProveedorForm({
  mode,
  plantillaId,
  initialData,
  initialEmitidoId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emitidoIdFromUrl = initialEmitidoId ?? searchParams.get('emitidoId') ?? undefined;
  const seccionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [servicios, setServicios] = useState<ServicioProveedor[]>([]);
  const [menus, setMenus] = useState<MenuBanqueteProveedor[]>([]);
  const [perfilEmpresa, setPerfilEmpresa] = useState<PerfilEmpresaResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [emitido, setEmitido] = useState<ContratoEmitidoProveedor | null>(null);
  const [activeSeccionId, setActiveSeccionId] = useState<string | null>(null);
  const [expandedSeccionId, setExpandedSeccionId] = useState<string | null>(null);

  const [nombre, setNombre] = useState(initialData?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? '');
  const [tipoServicio, setTipoServicio] = useState<TipoServicioContrato>(
    initialData?.tipoServicio ?? 'GENERAL',
  );
  const [servicioProveedorId, setServicioProveedorId] = useState(
    initialData?.servicioProveedorId ?? '',
  );
  const [menuBanqueteProveedorId, setMenuBanqueteProveedorId] = useState(
    initialData?.menuBanqueteProveedorId ?? '',
  );
  const [estado, setEstado] = useState<EstadoPlantillaContrato>(
    initialData?.estado ?? 'BORRADOR',
  );
  const [secciones, setSecciones] = useState<SeccionContrato[]>(() => {
    if (initialData?.modo === 'ARCHIVO' || !initialData?.secciones?.length) {
      return seccionesSugeridas(initialData?.tipoServicio ?? 'GENERAL');
    }
    return initialData.secciones;
  });
  const [savedPlantillaId, setSavedPlantillaId] = useState<string | undefined>(plantillaId);
  const [pdfVars, setPdfVars] = useState<PdfVars>(pdfVarsIniciales);
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [emailAsunto, setEmailAsunto] = useState('');
  const [emailMensaje, setEmailMensaje] = useState(
    'Te compartimos el contrato de servicios para tu evento. Por favor revísalo y confírmanos tu conformidad.',
  );

  const variables = pdfVarsToVariables(pdfVars, perfilEmpresa?.proveedor);

  useEffect(() => {
    if (!emitidoIdFromUrl) return;
    apiFetch<ContratoEmitidoProveedor>(`/portal/contratos-emitidos/${emitidoIdFromUrl}`)
      .then((data) => {
        setEmitido(data);
        setPdfVars({
          clienteNombre: data.clienteNombre ?? '',
          clienteEmpresa: data.clienteEmpresa ?? '',
          clienteEmail: data.clienteEmail ?? '',
          clienteTelefono: data.clienteTelefono ?? '',
          fechaEvento: data.fechaEvento
            ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(
                new Date(data.fechaEvento),
              )
            : '',
          lugarEvento: data.lugarEvento ?? '',
          montoTotal:
            data.montoTotal != null
              ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                  data.montoTotal,
                )
              : '',
          servicioNombre: data.servicioNombre ?? '',
        });
        setEmailDestinatario(data.clienteEmail ?? '');
        if (data.asuntoEnvio) setEmailAsunto(data.asuntoEnvio);
        if (data.mensajeEnvio) setEmailMensaje(data.mensajeEnvio);
      })
      .catch(() => setEmitido(null));
  }, [emitidoIdFromUrl]);

  useEffect(() => {
    Promise.all([
      apiFetch<ServicioProveedor[]>('/portal/servicios'),
      apiFetch<MenuBanqueteProveedor[]>('/portal/menus-banquete'),
      apiFetch<PerfilEmpresaResponse>('/portal/empresa'),
    ]).then(([s, m, perfil]) => {
      setServicios(s.filter((item) => item.activo));
      setMenus(m.filter((item) => item.activo));
      setPerfilEmpresa(perfil);
    });
  }, []);

  useEffect(() => {
    if (initialData?.servicio?.nombre) {
      setPdfVars((prev) => ({ ...prev, servicioNombre: initialData.servicio!.nombre }));
    } else if (initialData?.menu?.nombre) {
      setPdfVars((prev) => ({ ...prev, servicioNombre: initialData.menu!.nombre }));
    }
  }, [initialData]);

  useEffect(() => {
    if (mode === 'create' && secciones.length === 0) {
      setSecciones(seccionesSugeridas(tipoServicio));
    }
  }, [mode, tipoServicio, secciones.length]);

  useEffect(() => {
    if (secciones.length === 0) return;
    setExpandedSeccionId((prev) => {
      if (prev && secciones.some((s) => s.id === prev)) return prev;
      return secciones[0].id;
    });
    setActiveSeccionId((prev) => {
      if (prev && secciones.some((s) => s.id === prev)) return prev;
      return secciones[0].id;
    });
  }, [secciones]);

  function buildPayload(estadoFinal: EstadoPlantillaContrato) {
    return {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      tipoServicio,
      servicioProveedorId: servicioProveedorId || undefined,
      menuBanqueteProveedorId: menuBanqueteProveedorId || undefined,
      modo: 'EDITOR' as const,
      estado: estadoFinal,
      secciones,
    };
  }

  async function ensurePlantillaGuardada(
    estadoFinal: EstadoPlantillaContrato = estado,
  ): Promise<string> {
    const existingId = savedPlantillaId ?? plantillaId;
    if (existingId) return existingId;

    if (!nombre.trim()) {
      throw new Error('Indica un nombre para la plantilla');
    }
    if (secciones.length === 0) {
      throw new Error('Agrega al menos una cláusula al contrato');
    }

    const created = await apiFetch<PlantillaContratoProveedor>('/portal/contratos', {
      method: 'POST',
      body: JSON.stringify(buildPayload(estadoFinal)),
    });

    setSavedPlantillaId(created.id);
    if (created.secciones?.length) setSecciones(created.secciones);
    router.replace(`/proveedor/contratos/${created.id}`);
    return created.id;
  }

  function insertarVariable(seccionId: string, variable: string) {
    setSecciones((prev) =>
      prev.map((sec) =>
        sec.id === seccionId
          ? { ...sec, contenido: `${sec.contenido}{{${variable}}}` }
          : sec,
      ),
    );
    setActiveSeccionId(seccionId);
  }

  function moverSeccion(index: number, direction: -1 | 1) {
    setSecciones((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((sec, idx) => ({ ...sec, orden: idx }));
    });
  }

  function focusSeccion(seccionId: string) {
    setActiveSeccionId(seccionId);
    setExpandedSeccionId(seccionId);
    seccionRefs.current[seccionId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById(`preview-${seccionId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  function toggleSeccion(seccionId: string) {
    setActiveSeccionId(seccionId);
    setExpandedSeccionId((prev) => (prev === seccionId ? null : seccionId));
  }

  function agregarClausula() {
    const nueva = nuevaSeccionContrato(secciones.length);
    setSecciones((prev) => [...prev, nueva]);
    setActiveSeccionId(nueva.id);
    setExpandedSeccionId(nueva.id);
  }

  async function guardar(nuevoEstado?: EstadoPlantillaContrato) {
    if (!nombre.trim()) {
      alert('Indica un nombre para la plantilla');
      return;
    }
    if (secciones.length === 0) {
      alert('Agrega al menos una cláusula al contrato');
      return;
    }

    setSaving(true);
    try {
      const estadoFinal = nuevoEstado ?? estado;
      const payload = buildPayload(estadoFinal);

      if (mode === 'create' && !savedPlantillaId) {
        const created = await apiFetch<PlantillaContratoProveedor>('/portal/contratos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSavedPlantillaId(created.id);
        if (nuevoEstado) setEstado(nuevoEstado);
        router.replace(`/proveedor/contratos/${created.id}`);
        return;
      }

      const id = savedPlantillaId ?? plantillaId;
      if (!id) {
        alert('No se pudo identificar la plantilla');
        return;
      }

      await apiFetch<PlantillaContratoProveedor>(`/portal/contratos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (nuevoEstado) setEstado(nuevoEstado);
      alert('Contrato guardado');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function enviarEmail() {
    const destinatario = emailDestinatario.trim() || pdfVars.clienteEmail.trim();
    if (!destinatario) {
      alert('Indica el correo del cliente');
      return;
    }

    setEnviandoEmail(true);
    try {
      const id = await ensurePlantillaGuardada();
      const res = await apiFetch<EnviarContratoEmailResponse>(`/portal/contratos/${id}/enviar-email`, {
        method: 'POST',
        body: JSON.stringify({
          emitidoId: emitido?.id ?? emitidoIdFromUrl,
          destinatario,
          asunto: emailAsunto.trim() || undefined,
          mensaje: emailMensaje.trim() || undefined,
          clienteNombre: pdfVars.clienteNombre || undefined,
          clienteEmpresa: pdfVars.clienteEmpresa || undefined,
          clienteEmail: pdfVars.clienteEmail || undefined,
          clienteTelefono: pdfVars.clienteTelefono || undefined,
          fechaEvento: pdfVars.fechaEvento || undefined,
          lugarEvento: pdfVars.lugarEvento || undefined,
          montoTotal: pdfVars.montoTotal || undefined,
          servicioNombre: pdfVars.servicioNombre || undefined,
        }),
      });

      if (res.simulated) {
        alert(
          'Correo no configurado en el servidor. Configura RESEND_API_KEY en Railway (recomendado) o SMTP para envío local.',
        );
      } else {
        alert(`Contrato enviado a ${res.destinatario}`);
      }

      if (emitidoIdFromUrl) {
        const refreshed = await apiFetch<ContratoEmitidoProveedor>(
          `/portal/contratos-emitidos/${emitidoIdFromUrl}`,
        );
        setEmitido(refreshed);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo enviar el correo');
    } finally {
      setEnviandoEmail(false);
    }
  }

  async function generarPdf() {
    setGenerandoPdf(true);
    try {
      const id = await ensurePlantillaGuardada();
      const res = await apiFetch<ContratoPdfResponse>(`/portal/contratos/${id}/pdf`, {
        method: 'POST',
        body: JSON.stringify({
          clienteNombre: pdfVars.clienteNombre || undefined,
          clienteEmpresa: pdfVars.clienteEmpresa || undefined,
          clienteEmail: pdfVars.clienteEmail || undefined,
          clienteTelefono: pdfVars.clienteTelefono || undefined,
          fechaEvento: pdfVars.fechaEvento || undefined,
          lugarEvento: pdfVars.lugarEvento || undefined,
          montoTotal: pdfVars.montoTotal || undefined,
          servicioNombre: pdfVars.servicioNombre || undefined,
        }),
      });
      abrirPdfHtml(res.html, res.titulo);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo generar el PDF');
    } finally {
      setGenerandoPdf(false);
    }
  }

  async function eliminar() {
    if (!plantillaId) return;
    if (!confirm('¿Eliminar esta plantilla de contrato?')) return;
    try {
      await apiFetch(`/portal/contratos/${plantillaId}`, { method: 'DELETE' });
      router.push('/proveedor/contratos');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {emitido ? (
        <Card className="border-teal-200 bg-teal-50/50">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal-900">Contrato vinculado a cotización</p>
              <p className="text-sm text-teal-800">
                {emitido.folio}
                {emitido.cotizacion?.folio ? ` · Cotización ${emitido.cotizacion.folio}` : ''}
              </p>
              {emitido.enviadoEn ? (
                <p className="mt-1 text-xs text-teal-700">
                  Enviado a {emitido.enviadoA} el{' '}
                  {new Intl.DateTimeFormat('es-MX', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(emitido.enviadoEn))}
                </p>
              ) : null}
            </div>
            {emitido.cotizacion?.id ? (
              <Link
                href={`/proveedor/cotizaciones/${emitido.cotizacion.id}`}
                className="text-sm font-medium text-teal-800 hover:text-teal-950"
              >
                Ver cotización →
              </Link>
            ) : null}
          </div>
        </Card>
      ) : null}

      {initialData?.modo === 'ARCHIVO' ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <p className="text-sm text-amber-900">
            Esta plantilla tenía un archivo cargado. Ahora puedes editarla directamente con el
            editor de cláusulas. Los cambios reemplazarán el archivo anterior al guardar.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,1fr)]">
        <div className="space-y-5 min-w-0">
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className={ESTADO_PLANTILLA_CONTRATO_COLORS[estado]}>
                {ESTADO_PLANTILLA_CONTRATO_LABELS[estado]}
              </Badge>
              <Badge className="bg-slate-100 text-slate-700">
                {TIPO_SERVICIO_CONTRATO_LABELS[tipoServicio]}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-slate-700">
                  Nombre del contrato <span className="text-red-600">*</span>
                </span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Contrato de renta de mobiliario"
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Tipo de servicio</span>
                <select
                  value={tipoServicio}
                  onChange={(e) => {
                    const next = e.target.value as TipoServicioContrato;
                    setTipoServicio(next);
                    if (mode === 'create') {
                      setSecciones(seccionesSugeridas(next));
                    }
                  }}
                >
                  {(Object.keys(TIPO_SERVICIO_CONTRATO_LABELS) as TipoServicioContrato[]).map(
                    (t) => (
                      <option key={t} value={t}>
                        {TIPO_SERVICIO_CONTRATO_LABELS[t]}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Estado</span>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoPlantillaContrato)}
                >
                  {(Object.keys(ESTADO_PLANTILLA_CONTRATO_LABELS) as EstadoPlantillaContrato[]).map(
                    (e) => (
                      <option key={e} value={e}>
                        {ESTADO_PLANTILLA_CONTRATO_LABELS[e]}
                      </option>
                    ),
                  )}
                </select>
              </label>

              {(tipoServicio === 'SERVICIO' || tipoServicio === 'GENERAL') && (
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Vincular a servicio</span>
                  <select
                    value={servicioProveedorId}
                    onChange={(e) => {
                      setServicioProveedorId(e.target.value);
                      const svc = servicios.find((s) => s.id === e.target.value);
                      if (svc) setPdfVars((prev) => ({ ...prev, servicioNombre: svc.nombre }));
                    }}
                  >
                    <option value="">— Ninguno —</option>
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {(tipoServicio === 'BANQUETE' || tipoServicio === 'GENERAL') && (
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Vincular a menú banquete</span>
                  <select
                    value={menuBanqueteProveedorId}
                    onChange={(e) => {
                      setMenuBanqueteProveedorId(e.target.value);
                      const menu = menus.find((m) => m.id === e.target.value);
                      if (menu) setPdfVars((prev) => ({ ...prev, servicioNombre: menu.nombre }));
                    }}
                  >
                    <option value="">— Ninguno —</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-slate-700">Descripción interna</span>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Notas para identificar esta plantilla (no aparece en el contrato)"
                />
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Datos del cliente</h2>
            <p className="mb-4 text-sm text-slate-600">
              Completa los campos y verás cómo se reflejan en la vista previa del contrato.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {DATOS_CLIENTE_FIELDS.map(({ key, label, placeholder }) => (
                <label key={key} className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">{label}</span>
                  <input
                    value={pdfVars[key]}
                    onChange={(e) => setPdfVars((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Cláusulas del contrato</h2>
                <p className="text-sm text-slate-600">
                  Usa <strong>+ / −</strong> para expandir o colapsar. Solo una abierta a la vez.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs"
                  onClick={() => {
                    const sugeridas = seccionesSugeridas(tipoServicio);
                    setSecciones(sugeridas);
                    setExpandedSeccionId(sugeridas[0]?.id ?? null);
                    setActiveSeccionId(sugeridas[0]?.id ?? null);
                  }}
                >
                  Restaurar plantilla
                </Button>
                <Button type="button" variant="secondary" className="text-xs" onClick={agregarClausula}>
                  + Cláusula
                </Button>
              </div>
            </div>

            <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50/80">
              <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
                Variables disponibles ({'{{cliente_nombre}}'}, {'{{fecha_evento}}'}, …)
              </summary>
              <div className="flex flex-wrap gap-1.5 border-t border-slate-200 px-3 py-2">
                {VARIABLES_CONTRATO_AYUDA.map((v) => (
                  <span
                    key={v.key}
                    className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200"
                  >
                    {`{{${v.key}}}`}
                  </span>
                ))}
              </div>
            </details>

            <div className="space-y-2">
              {secciones.map((sec, index) => {
                const isActive = activeSeccionId === sec.id;
                const isExpanded = expandedSeccionId === sec.id;
                const tituloPreview = sec.titulo.trim() || 'Sin título';

                return (
                  <div
                    key={sec.id}
                    ref={(el) => {
                      seccionRefs.current[sec.id] = el;
                    }}
                    className={`overflow-hidden rounded-xl border transition ${
                      isActive
                        ? 'border-teal-400 bg-white shadow-sm ring-1 ring-teal-200'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Colapsar cláusula' : 'Expandir cláusula'}
                        onClick={() => toggleSeccion(sec.id)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg font-bold leading-none transition ${
                          isExpanded
                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                            : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isExpanded ? '−' : '+'}
                      </button>

                      <button
                        type="button"
                        onClick={() => focusSeccion(sec.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Cláusula {index + 1}
                        </span>
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {tituloPreview}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moverSeccion(index, -1)}
                          className="rounded p-1.5 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30"
                          title="Subir"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === secciones.length - 1}
                          onClick={() => moverSeccion(index, 1)}
                          className="rounded p-1.5 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30"
                          title="Bajar"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = secciones.filter((s) => s.id !== sec.id).map((s, idx) => ({ ...s, orden: idx }));
                            setSecciones(next);
                            if (expandedSeccionId === sec.id) {
                              setExpandedSeccionId(next[0]?.id ?? null);
                            }
                          }}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="space-y-3 border-t border-slate-200 bg-white px-4 py-4">
                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Título</span>
                          <input
                            value={sec.titulo}
                            onFocus={() => setActiveSeccionId(sec.id)}
                            onChange={(e) =>
                              setSecciones((prev) =>
                                prev.map((s) =>
                                  s.id === sec.id ? { ...s, titulo: e.target.value } : s,
                                ),
                              )
                            }
                          />
                        </label>

                        <label className="block text-sm">
                          <span className="mb-1 block font-medium text-slate-700">Contenido</span>
                          <textarea
                            value={sec.contenido}
                            onFocus={() => setActiveSeccionId(sec.id)}
                            onChange={(e) =>
                              setSecciones((prev) =>
                                prev.map((s) =>
                                  s.id === sec.id ? { ...s, contenido: e.target.value } : s,
                                ),
                              )
                            }
                            rows={5}
                            className="min-h-[120px] resize-y"
                          />
                        </label>

                        <div className="flex flex-wrap gap-1.5">
                          {VARIABLES_CONTRATO_AYUDA.slice(0, 6).map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => insertarVariable(sec.id, v.key)}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200"
                            >
                              + {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-slate-100 px-4 py-2">
                        <p className="line-clamp-2 text-xs text-slate-500">
                          {sec.contenido.trim() || 'Sin contenido — expande para editar'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <ContratoPreview
            nombre={nombre}
            tipoServicio={tipoServicio}
            secciones={secciones}
            variables={variables}
            proveedor={perfilEmpresa?.proveedor}
            perfil={perfilEmpresa?.perfil}
            activeSeccionId={activeSeccionId}
            onSeccionClick={focusSeccion}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void generarPdf()} disabled={generandoPdf || saving}>
              {generandoPdf ? 'Generando...' : 'Ver PDF para firmar'}
            </Button>
            <p className="text-xs text-slate-500">
              {mode === 'create' && !savedPlantillaId
                ? 'Se guardará automáticamente antes de abrir el PDF.'
                : 'Listo para imprimir o guardar como PDF.'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Enviar por correo</h2>
        <p className="mb-5 text-sm text-slate-600">
          El contrato se envía al cliente con el contenido listo para revisión y firma.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block text-sm lg:col-span-2">
            <span className="mb-1.5 block font-medium text-slate-700">Correo del cliente</span>
            <input
              type="email"
              value={emailDestinatario}
              onChange={(e) => setEmailDestinatario(e.target.value)}
              placeholder={pdfVars.clienteEmail || 'cliente@ejemplo.com'}
            />
          </label>

          <label className="block text-sm lg:col-span-2">
            <span className="mb-1.5 block font-medium text-slate-700">Asunto</span>
            <input
              value={emailAsunto}
              onChange={(e) => setEmailAsunto(e.target.value)}
              placeholder="Contrato de servicios para tu evento"
            />
          </label>

          <label className="block text-sm lg:col-span-2">
            <span className="mb-1.5 block font-medium text-slate-700">Mensaje</span>
            <textarea
              value={emailMensaje}
              onChange={(e) => setEmailMensaje(e.target.value)}
              rows={5}
              className="min-h-[140px] resize-y"
            />
          </label>

          <div className="lg:col-span-2">
            <Button
              type="button"
              onClick={() => void enviarEmail()}
              disabled={enviandoEmail || saving}
            >
              {enviandoEmail ? 'Enviando...' : 'Enviar contrato por email'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-72">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {mode === 'edit' ? (
              <Button type="button" variant="danger" onClick={() => void eliminar()}>
                Eliminar
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => void guardar()}>
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </Button>
            <Button type="button" disabled={saving} onClick={() => void guardar('ACTIVA')}>
              {saving ? 'Guardando...' : 'Activar plantilla'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
