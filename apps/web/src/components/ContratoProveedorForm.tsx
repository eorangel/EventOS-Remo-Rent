'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Card } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ARCHIVOS_CONTRATO_ACEPTADOS,
  VARIABLES_CONTRATO_AYUDA,
  abrirPdfHtml,
  fileToBase64,
  nuevaSeccionContrato,
  seccionesSugeridas,
} from '@/lib/contrato-proveedor';
import {
  ESTADO_PLANTILLA_CONTRATO_COLORS,
  ESTADO_PLANTILLA_CONTRATO_LABELS,
  MODO_PLANTILLA_CONTRATO_LABELS,
  TIPO_SERVICIO_CONTRATO_LABELS,
} from '@/lib/labels';
import type {
  ContratoEmitidoProveedor,
  ContratoPdfResponse,
  EnviarContratoEmailResponse,
  EstadoPlantillaContrato,
  MenuBanqueteProveedor,
  ModoPlantillaContrato,
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

export function ContratoProveedorForm({
  mode,
  plantillaId,
  initialData,
  initialEmitidoId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emitidoIdFromUrl = initialEmitidoId ?? searchParams.get('emitidoId') ?? undefined;

  const [servicios, setServicios] = useState<ServicioProveedor[]>([]);
  const [menus, setMenus] = useState<MenuBanqueteProveedor[]>([]);
  const [saving, setSaving] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [emitido, setEmitido] = useState<ContratoEmitidoProveedor | null>(null);

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
  const [modo, setModo] = useState<ModoPlantillaContrato>(initialData?.modo ?? 'EDITOR');
  const [estado, setEstado] = useState<EstadoPlantillaContrato>(
    initialData?.estado ?? 'BORRADOR',
  );
  const [secciones, setSecciones] = useState<SeccionContrato[]>(initialData?.secciones ?? []);
  const [archivoNombre, setArchivoNombre] = useState(initialData?.archivoNombre ?? '');
  const [savedPlantillaId, setSavedPlantillaId] = useState<string | undefined>(plantillaId);
  const [pdfVars, setPdfVars] = useState<PdfVars>(pdfVarsIniciales);
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [emailAsunto, setEmailAsunto] = useState('');
  const [emailMensaje, setEmailMensaje] = useState(
    'Te compartimos el contrato de servicios para tu evento. Por favor revísalo y confírmanos tu conformidad.',
  );

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
    ]).then(([s, m]) => {
      setServicios(s.filter((item) => item.activo));
      setMenus(m.filter((item) => item.activo));
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
    if (mode === 'create' && modo === 'EDITOR' && secciones.length === 0) {
      setSecciones(seccionesSugeridas(tipoServicio));
    }
  }, [mode, modo, tipoServicio, secciones.length]);

  function buildPayload(estadoFinal: EstadoPlantillaContrato) {
    return {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      tipoServicio,
      servicioProveedorId: servicioProveedorId || undefined,
      menuBanqueteProveedorId: menuBanqueteProveedorId || undefined,
      modo,
      estado: estadoFinal,
      secciones: modo === 'EDITOR' ? secciones : undefined,
    };
  }

  async function ensurePlantillaGuardada(
    estadoFinal: EstadoPlantillaContrato = estado,
  ): Promise<string> {
    const existingId = savedPlantillaId ?? plantillaId;
    if (existingId) return existingId;

    if (!nombre.trim()) {
      throw new Error('Indica un nombre para la plantilla en la sección superior');
    }
    if (modo === 'EDITOR' && secciones.length === 0) {
      throw new Error('Agrega al menos una cláusula o usa "Cargar cláusulas sugeridas"');
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

  async function guardar(nuevoEstado?: EstadoPlantillaContrato) {
    if (!nombre.trim()) {
      alert('Indica un nombre para la plantilla');
      return;
    }
    if (modo === 'EDITOR' && secciones.length === 0) {
      alert('Agrega al menos una cláusula al contrato o usa "Cargar cláusulas sugeridas"');
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

  async function subirArchivo(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo no debe superar 2 MB');
      return;
    }

    setSubiendoArchivo(true);
    try {
      const base64 = await fileToBase64(file);
      let id = plantillaId;

      if (mode === 'create' || !id) {
        if (!nombre.trim()) {
          alert('Primero indica un nombre para la plantilla');
          return;
        }
        const created = await apiFetch<PlantillaContratoProveedor>('/portal/contratos', {
          method: 'POST',
          body: JSON.stringify({
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || undefined,
            tipoServicio,
            servicioProveedorId: servicioProveedorId || undefined,
            menuBanqueteProveedorId: menuBanqueteProveedorId || undefined,
            modo: 'ARCHIVO',
          }),
        });
        id = created.id;
        router.replace(`/proveedor/contratos/${id}`);
      }

      const updated = await apiFetch<PlantillaContratoProveedor>(`/portal/contratos/${id}/archivo`, {
        method: 'POST',
        body: JSON.stringify({
          archivoNombre: file.name,
          archivoMime: file.type || 'application/octet-stream',
          archivoContenido: base64,
        }),
      });

      setModo('ARCHIVO');
      setArchivoNombre(updated.archivoNombre ?? file.name);
      setSecciones([]);
      alert('Archivo cargado correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo cargar el archivo');
    } finally {
      setSubiendoArchivo(false);
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
          'SMTP no está configurado en el servidor. El contrato se registró como envío simulado (revisa logs del API). Configura SMTP_HOST, SMTP_USER y SMTP_PASS para envío real.',
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

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className={ESTADO_PLANTILLA_CONTRATO_COLORS[estado]}>
            {ESTADO_PLANTILLA_CONTRATO_LABELS[estado]}
          </Badge>
          <Badge className="bg-slate-100 text-slate-700">
            {MODO_PLANTILLA_CONTRATO_LABELS[modo]}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">
              Nombre de la plantilla <span className="text-red-600">*</span>
            </span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Ej. Contrato de renta de mobiliario"
              required
            />
          </label>

          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Descripción (opcional)</span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Uso interno para identificar esta plantilla"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tipo de servicio</span>
            <select
              value={tipoServicio}
              onChange={(e) => setTipoServicio(e.target.value as TipoServicioContrato)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {(Object.keys(TIPO_SERVICIO_CONTRATO_LABELS) as TipoServicioContrato[]).map((t) => (
                <option key={t} value={t}>
                  {TIPO_SERVICIO_CONTRATO_LABELS[t]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Estado</span>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoPlantillaContrato)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Formato del contrato</h2>
        <p className="mb-4 text-sm text-slate-600">
          Arma el contrato con cláusulas editables o carga un archivo PDF/DOC existente.
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModo('EDITOR')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              modo === 'EDITOR'
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 bg-white text-slate-700'
            }`}
          >
            Editor interactivo
          </button>
          <button
            type="button"
            onClick={() => setModo('ARCHIVO')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              modo === 'ARCHIVO'
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 bg-white text-slate-700'
            }`}
          >
            Cargar archivo
          </button>
        </div>

        {modo === 'EDITOR' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Variables disponibles</p>
              <div className="flex flex-wrap gap-2">
                {VARIABLES_CONTRATO_AYUDA.map((v) => (
                  <span
                    key={v.key}
                    className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                  >
                    {`{{${v.key}}}`}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Inserta variables en el texto; se reemplazan al generar el PDF con los datos del cliente.
              </p>
            </div>

            {secciones.map((sec, index) => (
              <div key={sec.id} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cláusula {index + 1}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                      disabled={index === 0}
                      onClick={() => moverSeccion(index, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                      disabled={index === secciones.length - 1}
                      onClick={() => moverSeccion(index, 1)}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-2 py-1 text-xs"
                      onClick={() =>
                        setSecciones((prev) =>
                          prev.filter((s) => s.id !== sec.id).map((s, idx) => ({ ...s, orden: idx })),
                        )
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                <label className="mb-3 block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Título</span>
                  <input
                    value={sec.titulo}
                    onChange={(e) =>
                      setSecciones((prev) =>
                        prev.map((s) => (s.id === sec.id ? { ...s, titulo: e.target.value } : s)),
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Contenido</span>
                  <textarea
                    value={sec.contenido}
                    onChange={(e) =>
                      setSecciones((prev) =>
                        prev.map((s) => (s.id === sec.id ? { ...s, contenido: e.target.value } : s)),
                      )
                    }
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>

                <div className="mt-2 flex flex-wrap gap-1">
                  {VARIABLES_CONTRATO_AYUDA.slice(0, 6).map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => insertarVariable(sec.id, v.key)}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                    >
                      + {v.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSecciones(seccionesSugeridas(tipoServicio))}
              >
                Cargar cláusulas sugeridas
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setSecciones((prev) => [...prev, nuevaSeccionContrato(prev.length)])
                }
              >
                + Agregar cláusula
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="mb-2 text-sm text-slate-700">
              Sube tu contrato en PDF, DOC o DOCX (máx. 2 MB)
            </p>
            {archivoNombre ? (
              <p className="mb-3 text-sm font-medium text-emerald-700">
                Archivo actual: {archivoNombre}
              </p>
            ) : null}
            <input
              type="file"
              accept={ARCHIVOS_CONTRATO_ACEPTADOS}
              disabled={subiendoArchivo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void subirArchivo(file);
                e.target.value = '';
              }}
              className="mx-auto block text-sm"
            />
            {subiendoArchivo ? (
              <p className="mt-2 text-xs text-slate-500">Subiendo archivo...</p>
            ) : null}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Vista previa y envío</h2>
        <p className="mb-4 text-sm text-slate-600">
          Completa los datos del cliente para personalizar el contrato antes de imprimir o enviar.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ['clienteNombre', 'Nombre del cliente'],
              ['clienteEmpresa', 'Empresa'],
              ['clienteEmail', 'Email'],
              ['clienteTelefono', 'Teléfono'],
              ['fechaEvento', 'Fecha del evento'],
              ['lugarEvento', 'Lugar del evento'],
              ['montoTotal', 'Monto total'],
              ['servicioNombre', 'Nombre del servicio'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">{label}</span>
              <input
                value={pdfVars[key]}
                onChange={(e) => setPdfVars((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void generarPdf()} disabled={generandoPdf || saving}>
            {generandoPdf ? 'Generando...' : 'Ver PDF para firmar'}
          </Button>
          <p className="self-center text-xs text-slate-500">
            {mode === 'create' && !savedPlantillaId
              ? 'Se guardará la plantilla automáticamente antes de abrir el PDF.'
              : 'Se abrirá una ventana lista para imprimir o guardar como PDF.'}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Enviar por correo</h2>
        <p className="mb-4 text-sm text-slate-600">
          El contrato se envía al cliente con el contenido listo para revisión y firma.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Correo del cliente</span>
            <input
              type="email"
              value={emailDestinatario}
              onChange={(e) => setEmailDestinatario(e.target.value)}
              placeholder={pdfVars.clienteEmail || 'cliente@ejemplo.com'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Asunto</span>
            <input
              value={emailAsunto}
              onChange={(e) => setEmailAsunto(e.target.value)}
              placeholder="Contrato de servicios para tu evento"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">Mensaje</span>
            <textarea
              value={emailMensaje}
              onChange={(e) => setEmailMensaje(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            onClick={() => void enviarEmail()}
            disabled={enviandoEmail || saving}
          >
            {enviandoEmail ? 'Enviando...' : 'Enviar contrato por email'}
          </Button>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-72">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
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
            <Button
              type="button"
              disabled={saving}
              onClick={() => void guardar('ACTIVA')}
            >
              {saving ? 'Guardando...' : 'Activar plantilla'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
