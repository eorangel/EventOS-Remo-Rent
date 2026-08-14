'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch, apiDownload, apiUploadForm } from '@/lib/api';
import {
  CATEGORIAS_CATALOGO,
  ENTIDADES_FEDERATIVAS,
  ESTADO_VERIFICACION_COLORS,
  ESTADO_VERIFICACION_LABELS,
  ORIGEN_CAPTURA_LABELS,
  ROL_LABELS,
  TIPO_PROVEEDOR_LABELS,
  UNIDAD_MEDIDA_LABELS,
  formatMoney,
} from '@/lib/labels';
import type {
  EstadoVerificacionProveedor,
  OrigenCapturaProveedor,
  ProveedorExpediente,
  ResultadoImportacionProductos,
  RolUsuario,
  UnidadMedidaProducto,
  UsuarioProveedor,
  PerfilEmpresaResponse,
  HorarioDia,
} from '@/lib/types';

export default function ProveedorExpedientePage() {
  const params = useParams<{ id: string }>();
  const [exp, setExp] = useState<ProveedorExpediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'empresa' | 'productos' | 'cobertura' | 'servicios' | 'usuarios' | 'perfil-plataforma'>('empresa');

  const [productoForm, setProductoForm] = useState({
    nombre: '',
    categoria: 'Sillas',
    cantidadDisponible: '',
    precioReferencia: '',
    descripcion: '',
    fotoUrl: '',
    unidadMedida: 'PIEZA' as UnidadMedidaProducto,
  });

  const [coberturaForm, setCoberturaForm] = useState({ entidad: 'Ciudad de México', ciudad: '' });
  const [servicioForm, setServicioForm] = useState({ nombre: '', descripcion: '', precioReferencia: '' });

  const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ResultadoImportacionProductos | null>(null);
  const [importResult, setImportResult] = useState<ResultadoImportacionProductos | null>(null);
  const [importando, setImportando] = useState(false);

  const [usuarios, setUsuarios] = useState<UsuarioProveedor[]>([]);
  const [usuarioForm, setUsuarioForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'ADMIN_PROVEEDOR' as RolUsuario,
  });

  const [perfilPlataforma, setPerfilPlataforma] = useState<PerfilEmpresaResponse | null>(null);
  const [perfilLoading, setPerfilLoading] = useState(false);

  async function cargar() {
    if (!params.id) return;
    const data = await apiFetch<ProveedorExpediente>(`/proveedores/${params.id}/expediente`);
    setExp(data);
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
    if (params.id) {
      apiFetch<UsuarioProveedor[]>(`/proveedores/${params.id}/usuarios`)
        .then(setUsuarios)
        .catch(() => setUsuarios([]));
    }
  }, [params.id]);

  useEffect(() => {
    if (tab !== 'perfil-plataforma' || !params.id) return;
    setPerfilLoading(true);
    apiFetch<PerfilEmpresaResponse>(`/proveedores/${params.id}/perfil-empresa`)
      .then(setPerfilPlataforma)
      .catch(() => setPerfilPlataforma(null))
      .finally(() => setPerfilLoading(false));
  }, [tab, params.id]);

  async function guardarEmpresa(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!exp) return;
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await apiFetch(`/proveedores/${exp.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          estadoVerificacion: fd.get('estadoVerificacion') || undefined,
          origenCaptura: fd.get('origenCaptura') || undefined,
          eventosSimultaneosMax: fd.get('eventosSimultaneosMax')
            ? Number(fd.get('eventosSimultaneosMax'))
            : undefined,
          radioCoberturaKm: fd.get('radioCoberturaKm')
            ? Number(fd.get('radioCoberturaKm'))
            : undefined,
          unidadesMaxEntrega: fd.get('unidadesMaxEntrega')
            ? Number(fd.get('unidadesMaxEntrega'))
            : undefined,
        }),
      });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function agregarProducto(e: React.FormEvent) {
    e.preventDefault();
    if (!exp) return;
    setSaving(true);
    try {
      await apiFetch(`/proveedores/${exp.id}/productos`, {
        method: 'POST',
        body: JSON.stringify({
          nombre: productoForm.nombre,
          categoria: productoForm.categoria,
          cantidadDisponible: Number(productoForm.cantidadDisponible) || 0,
          precioReferencia: Number(productoForm.precioReferencia) || 0,
          descripcion: productoForm.descripcion || undefined,
          unidadMedida: productoForm.unidadMedida,
          fotos: productoForm.fotoUrl ? [{ url: productoForm.fotoUrl, esPrincipal: true }] : undefined,
        }),
      });
      setProductoForm({
        nombre: '',
        categoria: 'Sillas',
        cantidadDisponible: '',
        precioReferencia: '',
        descripcion: '',
        fotoUrl: '',
        unidadMedida: 'PIEZA',
      });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function agregarCobertura(e: React.FormEvent) {
    e.preventDefault();
    if (!exp) return;
    setSaving(true);
    try {
      await apiFetch(`/proveedores/${exp.id}/coberturas`, {
        method: 'POST',
        body: JSON.stringify(coberturaForm),
      });
      setCoberturaForm({ entidad: 'Ciudad de México', ciudad: '' });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function agregarServicio(e: React.FormEvent) {
    e.preventDefault();
    if (!exp) return;
    setSaving(true);
    try {
      await apiFetch(`/proveedores/${exp.id}/servicios`, {
        method: 'POST',
        body: JSON.stringify({
          nombre: servicioForm.nombre,
          descripcion: servicioForm.descripcion || undefined,
          precioReferencia: servicioForm.precioReferencia ? Number(servicioForm.precioReferencia) : undefined,
        }),
      });
      setServicioForm({ nombre: '', descripcion: '', precioReferencia: '' });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function descargarPlantillaExcel() {
    if (!exp) return;
    await apiDownload(
      `/proveedores/${exp.id}/productos/plantilla-excel`,
      'plantilla-inventario-proveedor.xlsx',
    );
  }

  async function procesarArchivoExcel(file: File, vistaPrevia: boolean) {
    if (!exp) return null;
    const formData = new FormData();
    formData.append('archivo', file);
    const query = vistaPrevia ? '?vistaPrevia=true' : '';
    return apiUploadForm<ResultadoImportacionProductos>(
      `/proveedores/${exp.id}/productos/importar-excel${query}`,
      formData,
    );
  }

  async function onSeleccionarExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setArchivoExcel(file);
    setImportResult(null);
    setImportPreview(null);
    setImportando(true);
    try {
      const preview = await procesarArchivoExcel(file, true);
      setImportPreview(preview);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo leer el archivo');
      setArchivoExcel(null);
    } finally {
      setImportando(false);
    }
  }

  async function confirmarImportacionExcel() {
    if (!archivoExcel) return;
    setImportando(true);
    try {
      const result = await procesarArchivoExcel(archivoExcel, false);
      setImportResult(result);
      setImportPreview(null);
      setArchivoExcel(null);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al importar');
    } finally {
      setImportando(false);
    }
  }

  async function crearUsuarioPortal(e: React.FormEvent) {
    e.preventDefault();
    if (!exp) return;
    setSaving(true);
    try {
      const nuevo = await apiFetch<UsuarioProveedor>(`/proveedores/${exp.id}/usuarios`, {
        method: 'POST',
        body: JSON.stringify(usuarioForm),
      });
      setUsuarios((prev) => [...prev, nuevo]);
      setUsuarioForm({
        nombre: '',
        email: '',
        password: '',
        rol: 'ADMIN_PROVEEDOR',
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo crear el usuario');
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'empresa' as const, label: 'Empresa' },
    { id: 'productos' as const, label: `Productos (${exp?.productos.length ?? 0})` },
    { id: 'cobertura' as const, label: `Cobertura (${exp?.coberturas.length ?? 0})` },
    { id: 'servicios' as const, label: `Servicios (${exp?.servicios.length ?? 0})` },
    { id: 'usuarios' as const, label: `Usuarios portal (${usuarios.length})` },
    { id: 'perfil-plataforma' as const, label: 'Perfil plataforma' },
  ];

  return (
    <>
      <PageHeader
        title={exp?.nombre ?? 'Proveedor'}
        description={exp?.razonSocial ?? 'Expediente del proveedor'}
        action={
          <Link href="/proveedores">
            <Button variant="secondary">← Red de proveedores</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando expediente...</p>
      ) : !exp ? (
        <p className="text-sm text-red-600">Proveedor no encontrado</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={ESTADO_VERIFICACION_COLORS[exp.estadoVerificacion ?? 'BORRADOR']}>
                  {ESTADO_VERIFICACION_LABELS[exp.estadoVerificacion ?? 'BORRADOR']}
                </Badge>
                <Badge className="bg-slate-100 text-slate-700">{TIPO_PROVEEDOR_LABELS[exp.tipo]}</Badge>
                {exp.origenCaptura && (
                  <Badge className="bg-blue-50 text-blue-800">
                    {ORIGEN_CAPTURA_LABELS[exp.origenCaptura]}
                  </Badge>
                )}
              </div>
              <div className="min-w-[200px]">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-500">Completitud del perfil</span>
                  <span className="font-semibold text-brand-700">{exp.completitudPerfil}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${exp.completitudPerfil}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'empresa' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Datos de la empresa</h2>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-slate-500">RFC</dt><dd>{exp.rfc ?? '—'}</dd></div>
                  <div><dt className="text-slate-500">Contacto</dt><dd>{exp.contacto ?? '—'}</dd></div>
                  <div><dt className="text-slate-500">Correo / Teléfono</dt><dd>{exp.email ?? '—'} · {exp.telefono ?? '—'}</dd></div>
                  <div><dt className="text-slate-500">Dirección</dt><dd>{exp.direccion ?? '—'}</dd></div>
                  <div><dt className="text-slate-500">Ubicación</dt><dd>{[exp.alcaldia, exp.ciudad, exp.entidadFederativa].filter(Boolean).join(', ') || '—'}</dd></div>
                  <div><dt className="text-slate-500">Sitio web</dt><dd>{exp.sitioWeb ?? '—'}</dd></div>
                </dl>
              </Card>
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Capacidad operativa</h2>
                <form onSubmit={guardarEmpresa} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Estado verificación</label>
                      <select name="estadoVerificacion" defaultValue={exp.estadoVerificacion} className="w-full text-sm">
                        {(['BORRADOR', 'EN_REVISION', 'VERIFICADO'] as EstadoVerificacionProveedor[]).map((v) => (
                          <option key={v} value={v}>{ESTADO_VERIFICACION_LABELS[v]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Origen captura</label>
                      <select name="origenCaptura" defaultValue={exp.origenCaptura} className="w-full text-sm">
                        {(['INTERNO', 'TELEFONO', 'VISITA', 'WEB'] as OrigenCapturaProveedor[]).map((v) => (
                          <option key={v} value={v}>{ORIGEN_CAPTURA_LABELS[v]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Eventos simultáneos</label>
                      <input name="eventosSimultaneosMax" type="number" min="0" defaultValue={exp.eventosSimultaneosMax ?? ''} className="w-full text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Unidades máx. entrega</label>
                      <input name="unidadesMaxEntrega" type="number" min="0" defaultValue={exp.unidadesMaxEntrega ?? ''} className="w-full text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Radio cobertura (km)</label>
                      <input name="radioCoberturaKm" type="number" min="0" defaultValue={exp.radioCoberturaKm ?? ''} className="w-full text-sm" />
                    </div>
                  </div>
                  <Button type="submit" disabled={saving}>Guardar capacidad</Button>
                </form>
              </Card>
            </div>
          )}

          {tab === 'productos' && (
            <div className="space-y-6">
              <Card>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Importar inventario desde Excel</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Suba el catálogo del proveedor (.xlsx). Columnas: Nombre, Categoría, Cantidad,
                      Precio referencia, Unidad, Descripción y URL foto.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={descargarPlantillaExcel}>
                      Descargar plantilla
                    </Button>
                    <label className="inline-flex cursor-pointer">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={onSeleccionarExcel}
                        disabled={importando}
                      />
                      <span className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                        {importando ? 'Procesando...' : 'Seleccionar Excel'}
                      </span>
                    </label>
                  </div>
                </div>

                {archivoExcel && (
                  <p className="mt-3 text-sm text-slate-600">
                    Archivo: <span className="font-medium">{archivoExcel.name}</span>
                  </p>
                )}

                {importResult && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    Importación completada: {importResult.creados ?? 0} creados,{' '}
                    {importResult.actualizados ?? 0} actualizados
                    {importResult.invalidas > 0 && ` · ${importResult.invalidas} filas omitidas por errores`}.
                  </div>
                )}

                {importPreview && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-600">
                        Vista previa: {importPreview.validas} válidas · {importPreview.invalidas} con errores
                      </p>
                      <Button
                        type="button"
                        disabled={importando || importPreview.validas === 0}
                        onClick={confirmarImportacionExcel}
                      >
                        Importar {importPreview.validas} producto(s)
                      </Button>
                    </div>
                    <div className="max-h-64 overflow-auto rounded-xl border border-slate-200">
                      <table className="min-w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Fila</th>
                            <th className="px-3 py-2">Producto</th>
                            <th className="px-3 py-2">Cantidad</th>
                            <th className="px-3 py-2">Precio</th>
                            <th className="px-3 py-2">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.filas.map((fila) => (
                            <tr key={fila.fila} className="border-t border-slate-100">
                              <td className="px-3 py-2">{fila.fila}</td>
                              <td className="px-3 py-2">
                                <p className="font-medium">{fila.nombre || '—'}</p>
                                {fila.categoria && (
                                  <p className="text-xs text-slate-500">{fila.categoria}</p>
                                )}
                              </td>
                              <td className="px-3 py-2">{fila.cantidadDisponible}</td>
                              <td className="px-3 py-2">{formatMoney(fila.precioReferencia)}</td>
                              <td className="px-3 py-2">
                                {fila.valido ? (
                                  <span className="text-emerald-700">OK</span>
                                ) : (
                                  <span className="text-red-600">{fila.errores.join('; ')}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold">Catálogo de productos</h2>
                {exp.productos.length === 0 ? (
                  <p className="text-sm text-slate-500">Aún no hay productos catalogados.</p>
                ) : (
                  <div className="space-y-4">
                    {exp.productos.map((p) => (
                      <div key={p.id} className="flex gap-4 rounded-xl border border-slate-200 p-4">
                        {p.fotos?.[0] ? (
                          <img src={p.fotos[0].url} alt={p.nombre} className="h-20 w-20 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">Sin foto</div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{p.nombre}</p>
                          <p className="text-sm text-slate-500">{p.categoria} · {p.cantidadDisponible} {UNIDAD_MEDIDA_LABELS[p.unidadMedida].toLowerCase()}(s)</p>
                          <p className="text-sm font-semibold text-brand-700">{formatMoney(p.precioReferencia)} ref.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Agregar producto</h2>
                <form onSubmit={agregarProducto} className="space-y-3">
                  <input required placeholder="Nombre del producto" value={productoForm.nombre} onChange={(e) => setProductoForm({ ...productoForm, nombre: e.target.value })} className="w-full text-sm" />
                  <select value={productoForm.categoria} onChange={(e) => setProductoForm({ ...productoForm, categoria: e.target.value })} className="w-full text-sm">
                    {CATEGORIAS_CATALOGO.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" min="0" placeholder="Cantidad" value={productoForm.cantidadDisponible} onChange={(e) => setProductoForm({ ...productoForm, cantidadDisponible: e.target.value })} className="w-full text-sm" />
                    <input type="number" min="0" step="0.01" placeholder="Precio ref." value={productoForm.precioReferencia} onChange={(e) => setProductoForm({ ...productoForm, precioReferencia: e.target.value })} className="w-full text-sm" />
                  </div>
                  <input placeholder="URL de fotografía (opcional)" value={productoForm.fotoUrl} onChange={(e) => setProductoForm({ ...productoForm, fotoUrl: e.target.value })} className="w-full text-sm" />
                  <textarea rows={2} placeholder="Descripción" value={productoForm.descripcion} onChange={(e) => setProductoForm({ ...productoForm, descripcion: e.target.value })} className="w-full text-sm" />
                  <Button type="submit" disabled={saving} className="w-full">Agregar al catálogo</Button>
                </form>
              </Card>
            </div>
            </div>
          )}

          {tab === 'cobertura' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Zonas de cobertura</h2>
                {exp.coberturas.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin cobertura registrada.</p>
                ) : (
                  <ul className="space-y-2">
                    {exp.coberturas.map((c) => (
                      <li key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-medium">{c.entidad}</span>
                        {c.ciudad && <span className="text-slate-500"> — {c.ciudad}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Agregar cobertura</h2>
                <form onSubmit={agregarCobertura} className="space-y-3">
                  <select value={coberturaForm.entidad} onChange={(e) => setCoberturaForm({ ...coberturaForm, entidad: e.target.value })} className="w-full text-sm">
                    {ENTIDADES_FEDERATIVAS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input placeholder="Ciudad (opcional)" value={coberturaForm.ciudad} onChange={(e) => setCoberturaForm({ ...coberturaForm, ciudad: e.target.value })} className="w-full text-sm" />
                  <Button type="submit" disabled={saving} className="w-full">Agregar zona</Button>
                </form>
              </Card>
            </div>
          )}

          {tab === 'servicios' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Servicios ofrecidos</h2>
                {exp.servicios.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin servicios registrados (montaje, flete, etc.).</p>
                ) : (
                  <ul className="space-y-3">
                    {exp.servicios.map((s) => (
                      <li key={s.id} className="rounded-xl border border-slate-200 px-4 py-3">
                        <p className="font-medium">{s.nombre}</p>
                        {s.descripcion && <p className="text-sm text-slate-500">{s.descripcion}</p>}
                        {s.precioReferencia != null && (
                          <p className="text-sm text-brand-700">{formatMoney(s.precioReferencia)} ref.</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Agregar servicio</h2>
                <form onSubmit={agregarServicio} className="space-y-3">
                  <input required placeholder="Ej. Montaje, Flete, Diseño" value={servicioForm.nombre} onChange={(e) => setServicioForm({ ...servicioForm, nombre: e.target.value })} className="w-full text-sm" />
                  <textarea rows={2} placeholder="Descripción" value={servicioForm.descripcion} onChange={(e) => setServicioForm({ ...servicioForm, descripcion: e.target.value })} className="w-full text-sm" />
                  <input type="number" min="0" step="0.01" placeholder="Precio referencia (opcional)" value={servicioForm.precioReferencia} onChange={(e) => setServicioForm({ ...servicioForm, precioReferencia: e.target.value })} className="w-full text-sm" />
                  <Button type="submit" disabled={saving} className="w-full">Agregar servicio</Button>
                </form>
              </Card>
            </div>
          )}

          {tab === 'usuarios' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Acceso al portal</h2>
                <p className="mb-4 text-sm text-slate-500">
                  Crea credenciales para que el proveedor entre en{' '}
                  <code className="rounded bg-slate-100 px-1">/proveedor</code> y gestione clientes y cobros.
                </p>
                <form onSubmit={crearUsuarioPortal} className="space-y-3">
                  <input
                    required
                    placeholder="Nombre completo"
                    value={usuarioForm.nombre}
                    onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Correo de acceso"
                    value={usuarioForm.email}
                    onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
                    className="w-full text-sm"
                  />
                  <input
                    required
                    type="password"
                    minLength={6}
                    placeholder="Contraseña temporal"
                    value={usuarioForm.password}
                    onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })}
                    className="w-full text-sm"
                  />
                  <select
                    value={usuarioForm.rol}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, rol: e.target.value as RolUsuario })
                    }
                    className="w-full text-sm"
                  >
                    <option value="ADMIN_PROVEEDOR">{ROL_LABELS.ADMIN_PROVEEDOR}</option>
                    <option value="OPERADOR_PROVEEDOR">{ROL_LABELS.OPERADOR_PROVEEDOR}</option>
                  </select>
                  <Button type="submit" disabled={saving} className="w-full">
                    Crear usuario portal
                  </Button>
                </form>
              </Card>
              <Card>
                <h2 className="mb-4 text-lg font-semibold">Usuarios registrados</h2>
                {usuarios.length === 0 ? (
                  <p className="text-sm text-slate-500">Este proveedor aún no tiene acceso al portal.</p>
                ) : (
                  <ul className="space-y-3">
                    {usuarios.map((u) => (
                      <li key={u.id} className="rounded-xl border border-slate-200 px-4 py-3">
                        <p className="font-medium text-slate-900">{u.nombre}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge className="bg-teal-50 text-teal-800">{ROL_LABELS[u.rol]}</Badge>
                          <Badge className={u.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}

          {tab === 'perfil-plataforma' && (
            <div className="space-y-6">
              {perfilLoading ? (
                <p className="text-sm text-slate-500">Cargando perfil de plataforma...</p>
              ) : !perfilPlataforma?.perfil ? (
                <Card>
                  <p className="text-sm text-slate-500">
                    No se pudo cargar el perfil de plataforma. Intenta de nuevo en unos momentos.
                  </p>
                </Card>
              ) : (
                <>
                  {!perfilPlataforma.perfil.updatedAt && (
                    <Card className="border-amber-200 bg-amber-50">
                      <p className="text-sm text-amber-900">
                        Este proveedor aún no ha guardado su perfil en el portal. Los datos que ves
                        son los registrados al dar de alta la empresa o valores vacíos por defecto.
                      </p>
                    </Card>
                  )}
                  <Card>
                    <div className="flex flex-wrap items-center gap-4">
                      {perfilPlataforma.perfil.logoUrl ? (
                        <img
                          src={perfilPlataforma.perfil.logoUrl}
                          alt="Logo"
                          className="h-16 w-16 rounded-xl border object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                          Sin logo
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-900">
                          {perfilPlataforma.proveedor.nombre}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {perfilPlataforma.proveedor.razonSocial ?? 'Razón social pendiente'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge className="bg-teal-50 text-teal-800">
                            Perfil {perfilPlataforma.completitudPerfilEmpresa}% completo
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-700">
                            {perfilPlataforma.perfil.moneda}
                            {perfilPlataforma.perfil.ivaIncluido ? ' · IVA incluido' : ' · + IVA'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <h3 className="mb-3 font-semibold text-slate-900">Datos fiscales</h3>
                      <dl className="space-y-2 text-sm">
                        <div><dt className="text-slate-500">RFC</dt><dd>{perfilPlataforma.proveedor.rfc ?? '—'}</dd></div>
                        <div><dt className="text-slate-500">Régimen fiscal</dt><dd>{perfilPlataforma.perfil.regimenFiscal ?? '—'}</dd></div>
                        <div><dt className="text-slate-500">C.P.</dt><dd>{perfilPlataforma.perfil.codigoPostal ?? '—'}</dd></div>
                      </dl>
                    </Card>
                    <Card>
                      <h3 className="mb-3 font-semibold text-slate-900">Contacto y ubicación</h3>
                      <dl className="space-y-2 text-sm">
                        <div><dt className="text-slate-500">Correo</dt><dd>{perfilPlataforma.proveedor.email ?? '—'}</dd></div>
                        <div><dt className="text-slate-500">Teléfono</dt><dd>{perfilPlataforma.proveedor.telefono ?? '—'}</dd></div>
                        <div><dt className="text-slate-500">Dirección</dt><dd>{perfilPlataforma.proveedor.direccion ?? '—'}</dd></div>
                        <div><dt className="text-slate-500">Ciudad</dt><dd>{[perfilPlataforma.proveedor.ciudad, perfilPlataforma.proveedor.entidadFederativa].filter(Boolean).join(', ') || '—'}</dd></div>
                      </dl>
                    </Card>
                    <Card>
                      <h3 className="mb-3 font-semibold text-slate-900">Redes sociales</h3>
                      <dl className="space-y-2 text-sm">
                        {Object.entries(perfilPlataforma.perfil.redesSociales ?? {}).map(([k, v]) =>
                          v ? (
                            <div key={k}>
                              <dt className="capitalize text-slate-500">{k}</dt>
                              <dd className="break-all">{v}</dd>
                            </div>
                          ) : null,
                        )}
                        {!Object.values(perfilPlataforma.perfil.redesSociales ?? {}).some(Boolean) && (
                          <p className="text-slate-500">Sin redes registradas</p>
                        )}
                      </dl>
                    </Card>
                    <Card>
                      <h3 className="mb-3 font-semibold text-slate-900">Horario</h3>
                      <ul className="space-y-1 text-sm">
                        {(perfilPlataforma.perfil.horario?.dias as HorarioDia[] | undefined)?.map((d) => (
                          <li key={d.dia} className="flex justify-between rounded bg-slate-50 px-2 py-1">
                            <span>{d.dia}</span>
                            <span className="text-slate-600">
                              {d.cerrado ? 'Cerrado' : `${d.abre ?? '—'} – ${d.cierra ?? '—'}`}
                            </span>
                          </li>
                        )) ?? <li className="text-slate-500">Sin horario</li>}
                      </ul>
                    </Card>
                    <Card className="lg:col-span-2">
                      <h3 className="mb-3 font-semibold text-slate-900">Políticas de renta</h3>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {perfilPlataforma.perfil.politicasRenta ?? 'No especificadas'}
                      </p>
                    </Card>
                    <Card className="lg:col-span-2">
                      <h3 className="mb-3 font-semibold text-slate-900">Condiciones de cancelación</h3>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {perfilPlataforma.perfil.condicionesCancelacion ?? 'No especificadas'}
                      </p>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
