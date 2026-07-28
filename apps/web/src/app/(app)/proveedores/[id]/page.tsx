'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  CATEGORIAS_CATALOGO,
  ENTIDADES_FEDERATIVAS,
  ESTADO_VERIFICACION_COLORS,
  ESTADO_VERIFICACION_LABELS,
  ORIGEN_CAPTURA_LABELS,
  TIPO_PROVEEDOR_LABELS,
  UNIDAD_MEDIDA_LABELS,
  formatMoney,
} from '@/lib/labels';
import type {
  EstadoVerificacionProveedor,
  OrigenCapturaProveedor,
  ProveedorExpediente,
  UnidadMedidaProducto,
} from '@/lib/types';

export default function ProveedorExpedientePage() {
  const params = useParams<{ id: string }>();
  const [exp, setExp] = useState<ProveedorExpediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'empresa' | 'productos' | 'cobertura' | 'servicios'>('empresa');

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

  async function cargar() {
    if (!params.id) return;
    const data = await apiFetch<ProveedorExpediente>(`/proveedores/${params.id}/expediente`);
    setExp(data);
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [params.id]);

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

  const tabs = [
    { id: 'empresa' as const, label: 'Empresa' },
    { id: 'productos' as const, label: `Productos (${exp?.productos.length ?? 0})` },
    { id: 'cobertura' as const, label: `Cobertura (${exp?.coberturas.length ?? 0})` },
    { id: 'servicios' as const, label: `Servicios (${exp?.servicios.length ?? 0})` },
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
                  <div><dt className="text-slate-500">Ubicación</dt><dd>{[exp.ciudad, exp.entidadFederativa].filter(Boolean).join(', ') || '—'}</dd></div>
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
        </div>
      )}
    </>
  );
}
