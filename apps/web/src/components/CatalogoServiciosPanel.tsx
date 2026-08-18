'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  MODALIDAD_PRECIO_MENU_LABELS,
  SECCION_PLATILLO_LABELS,
  SECCIONES_PLATILLO_ORDEN,
  formatMoney,
} from '@/lib/labels';
import type {
  MenuBanqueteProveedor,
  PlatilloMenuBanquete,
  SeccionPlatilloMenu,
  ServicioProveedor,
} from '@/lib/types';

const servicioInicial = {
  nombre: '',
  descripcion: '',
  precioReferencia: '',
  activo: true,
};

const menuInicial = {
  nombre: '',
  descripcion: '',
  precioPorPersona: '',
  precioPorEvento: '',
  minimoPersonas: '',
  incluyeBebidas: false,
  incluyeMeseros: false,
  notas: '',
  activo: true,
};

function platilloVacio(seccion: SeccionPlatilloMenu): PlatilloMenuBanquete {
  return { seccion, nombre: '', descripcion: '', orden: 0 };
}

export function CatalogoServiciosPanel() {
  const [servicios, setServicios] = useState<ServicioProveedor[]>([]);
  const [menus, setMenus] = useState<MenuBanqueteProveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editServicioId, setEditServicioId] = useState<string | null>(null);
  const [editMenuId, setEditMenuId] = useState<string | null>(null);
  const [formServicio, setFormServicio] = useState(servicioInicial);
  const [formMenu, setFormMenu] = useState(menuInicial);
  const [platillos, setPlatillos] = useState<PlatilloMenuBanquete[]>([]);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  async function cargar() {
    const [s, m] = await Promise.all([
      apiFetch<ServicioProveedor[]>('/portal/servicios'),
      apiFetch<MenuBanqueteProveedor[]>('/portal/menus-banquete'),
    ]);
    setServicios(s);
    setMenus(m);
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, []);

  function resetServicioForm() {
    setEditServicioId(null);
    setFormServicio(servicioInicial);
  }

  function resetMenuForm() {
    setEditMenuId(null);
    setFormMenu(menuInicial);
    setPlatillos([]);
  }

  function iniciarEdicionServicio(s: ServicioProveedor) {
    setEditServicioId(s.id);
    setFormServicio({
      nombre: s.nombre,
      descripcion: s.descripcion ?? '',
      precioReferencia: s.precioReferencia != null ? String(s.precioReferencia) : '',
      activo: s.activo,
    });
  }

  function iniciarEdicionMenu(m: MenuBanqueteProveedor) {
    setEditMenuId(m.id);
    setFormMenu({
      nombre: m.nombre,
      descripcion: m.descripcion ?? '',
      precioPorPersona: m.precioPorPersona != null ? String(m.precioPorPersona) : '',
      precioPorEvento: m.precioPorEvento != null ? String(m.precioPorEvento) : '',
      minimoPersonas: m.minimoPersonas != null ? String(m.minimoPersonas) : '',
      incluyeBebidas: m.incluyeBebidas,
      incluyeMeseros: m.incluyeMeseros,
      notas: m.notas ?? '',
      activo: m.activo,
    });
    setPlatillos(m.platillos?.length ? [...m.platillos] : []);
  }

  async function guardarServicio(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: formServicio.nombre.trim(),
        descripcion: formServicio.descripcion.trim() || undefined,
        precioReferencia: formServicio.precioReferencia
          ? Number(formServicio.precioReferencia)
          : undefined,
        activo: formServicio.activo,
      };
      if (editServicioId) {
        await apiFetch(`/portal/servicios/${editServicioId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        resetServicioForm();
      } else {
        await apiFetch('/portal/servicios', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setFormServicio(servicioInicial);
      }
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function eliminarServicio(s: ServicioProveedor) {
    if (!window.confirm(`¿Eliminar el servicio "${s.nombre}"?`)) return;
    setEliminandoId(s.id);
    try {
      await apiFetch(`/portal/servicios/${s.id}`, { method: 'DELETE' });
      if (editServicioId === s.id) resetServicioForm();
      await cargar();
    } finally {
      setEliminandoId(null);
    }
  }

  function agregarPlatillo(seccion: SeccionPlatilloMenu) {
    setPlatillos((prev) => [...prev, platilloVacio(seccion)]);
  }

  function actualizarPlatillo(index: number, patch: Partial<PlatilloMenuBanquete>) {
    setPlatillos((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function quitarPlatillo(index: number) {
    setPlatillos((prev) => prev.filter((_, i) => i !== index));
  }

  async function guardarMenu(e: React.FormEvent) {
    e.preventDefault();
    const porPersona = formMenu.precioPorPersona ? Number(formMenu.precioPorPersona) : null;
    const porEvento = formMenu.precioPorEvento ? Number(formMenu.precioPorEvento) : null;
    if (porPersona == null && porEvento == null) {
      alert('Indica precio por persona, por evento, o ambos');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: formMenu.nombre.trim(),
        descripcion: formMenu.descripcion.trim() || undefined,
        precioPorPersona: porPersona,
        precioPorEvento: porEvento,
        minimoPersonas: formMenu.minimoPersonas ? Number(formMenu.minimoPersonas) : undefined,
        incluyeBebidas: formMenu.incluyeBebidas,
        incluyeMeseros: formMenu.incluyeMeseros,
        notas: formMenu.notas.trim() || undefined,
        activo: formMenu.activo,
        platillos: platillos
          .filter((p) => p.nombre.trim())
          .map((p, i) => ({
            seccion: p.seccion,
            nombre: p.nombre.trim(),
            descripcion: p.descripcion?.trim() || undefined,
            orden: i,
          })),
      };

      if (editMenuId) {
        await apiFetch(`/portal/menus-banquete/${editMenuId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        resetMenuForm();
      } else {
        await apiFetch('/portal/menus-banquete', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        resetMenuForm();
      }
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function eliminarMenu(m: MenuBanqueteProveedor) {
    if (!window.confirm(`¿Eliminar el menú "${m.nombre}"?`)) return;
    setEliminandoId(m.id);
    try {
      await apiFetch(`/portal/menus-banquete/${m.id}`, { method: 'DELETE' });
      if (editMenuId === m.id) resetMenuForm();
      await cargar();
    } finally {
      setEliminandoId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando servicios...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">
            {editServicioId ? 'Editar servicio' : 'Agregar servicio'}
          </h2>
          <form onSubmit={guardarServicio} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre *</label>
              <input
                value={formServicio.nombre}
                onChange={(e) => setFormServicio({ ...formServicio, nombre: e.target.value })}
                required
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Precio referencia
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formServicio.precioReferencia}
                onChange={(e) =>
                  setFormServicio({ ...formServicio, precioReferencia: e.target.value })
                }
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
              <textarea
                value={formServicio.descripcion}
                onChange={(e) =>
                  setFormServicio({ ...formServicio, descripcion: e.target.value })
                }
                rows={2}
                className="w-full text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formServicio.activo}
                onChange={(e) => setFormServicio({ ...formServicio, activo: e.target.checked })}
              />
              Activo en catálogo
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editServicioId ? 'Guardar' : 'Agregar'}
              </Button>
              {editServicioId && (
                <Button type="button" variant="secondary" onClick={resetServicioForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Servicios ({servicios.length})</h2>
          {servicios.length === 0 ? (
            <p className="text-sm text-slate-500">
              Sin servicios. Agrega montaje, transporte, coordinación, etc.
            </p>
          ) : (
            <div className="space-y-3">
              {servicios.map((s) => (
                <div
                  key={s.id}
                  className={`flex flex-wrap items-start justify-between gap-2 rounded-xl border px-4 py-3 ${
                    editServicioId === s.id ? 'border-teal-400 bg-teal-50/40' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{s.nombre}</p>
                    {s.descripcion && (
                      <p className="mt-1 text-sm text-slate-600">{s.descripcion}</p>
                    )}
                    {!s.activo && (
                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {s.precioReferencia != null && (
                      <span className="font-semibold">{formatMoney(s.precioReferencia)}</span>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs"
                        onClick={() => iniciarEdicionServicio(s)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="text-xs"
                        disabled={eliminandoId === s.id}
                        onClick={() => eliminarServicio(s)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="border-t border-slate-200 pt-2">
        <h2 className="text-xl font-semibold text-slate-900">Banquetes — menús</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define menús con platillos por sección. Puedes cotizar por persona, por evento, o ambos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">
            {editMenuId ? 'Editar menú' : 'Nuevo menú de banquete'}
          </h2>
          <form onSubmit={guardarMenu} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre *</label>
              <input
                value={formMenu.nombre}
                onChange={(e) => setFormMenu({ ...formMenu, nombre: e.target.value })}
                required
                className="w-full text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Precio / persona
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formMenu.precioPorPersona}
                  onChange={(e) =>
                    setFormMenu({ ...formMenu, precioPorPersona: e.target.value })
                  }
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Precio / evento
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formMenu.precioPorEvento}
                  onChange={(e) =>
                    setFormMenu({ ...formMenu, precioPorEvento: e.target.value })
                  }
                  className="w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Mínimo de personas
              </label>
              <input
                type="number"
                min="1"
                value={formMenu.minimoPersonas}
                onChange={(e) => setFormMenu({ ...formMenu, minimoPersonas: e.target.value })}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
              <textarea
                value={formMenu.descripcion}
                onChange={(e) => setFormMenu({ ...formMenu, descripcion: e.target.value })}
                rows={2}
                className="w-full text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formMenu.incluyeBebidas}
                  onChange={(e) =>
                    setFormMenu({ ...formMenu, incluyeBebidas: e.target.checked })
                  }
                />
                Incluye bebidas
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formMenu.incluyeMeseros}
                  onChange={(e) =>
                    setFormMenu({ ...formMenu, incluyeMeseros: e.target.checked })
                  }
                />
                Incluye meseros
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formMenu.activo}
                  onChange={(e) => setFormMenu({ ...formMenu, activo: e.target.checked })}
                />
                Activo
              </label>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">Platillos</span>
                <div className="flex flex-wrap gap-1">
                  {SECCIONES_PLATILLO_ORDEN.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => agregarPlatillo(sec)}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-200"
                    >
                      + {SECCION_PLATILLO_LABELS[sec]}
                    </button>
                  ))}
                </div>
              </div>
              {platillos.length === 0 ? (
                <p className="text-xs text-slate-500">Agrega platillos por sección del menú.</p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-auto rounded-lg border border-slate-200 p-2">
                  {platillos.map((p, i) => (
                    <div key={i} className="grid gap-1 rounded border border-slate-100 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-teal-700">
                          {SECCION_PLATILLO_LABELS[p.seccion]}
                        </span>
                        <button
                          type="button"
                          onClick={() => quitarPlatillo(i)}
                          className="text-xs text-red-600"
                        >
                          Quitar
                        </button>
                      </div>
                      <input
                        value={p.nombre}
                        onChange={(e) => actualizarPlatillo(i, { nombre: e.target.value })}
                        placeholder="Nombre del platillo"
                        className="text-sm"
                      />
                      <input
                        value={p.descripcion ?? ''}
                        onChange={(e) => actualizarPlatillo(i, { descripcion: e.target.value })}
                        placeholder="Descripción (opcional)"
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editMenuId ? 'Guardar menú' : 'Crear menú'}
              </Button>
              {editMenuId && (
                <Button type="button" variant="secondary" onClick={resetMenuForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Menús ({menus.length})</h2>
          {menus.length === 0 ? (
            <p className="text-sm text-slate-500">Sin menús de banquete configurados.</p>
          ) : (
            <div className="space-y-4">
              {menus.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border px-4 py-3 ${
                    editMenuId === m.id ? 'border-teal-400 bg-teal-50/40' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{m.nombre}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-600">
                        {m.precioPorPersona != null && (
                          <span>{formatMoney(m.precioPorPersona)} / persona</span>
                        )}
                        {m.precioPorEvento != null && (
                          <span>{formatMoney(m.precioPorEvento)} / evento</span>
                        )}
                        {m.minimoPersonas != null && (
                          <span>Mín. {m.minimoPersonas} pers.</span>
                        )}
                      </div>
                      {(m.incluyeBebidas || m.incluyeMeseros) && (
                        <p className="mt-1 text-xs text-slate-500">
                          {[m.incluyeBebidas && 'Bebidas', m.incluyeMeseros && 'Meseros']
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs"
                        onClick={() => iniciarEdicionMenu(m)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="text-xs"
                        disabled={eliminandoId === m.id}
                        onClick={() => eliminarMenu(m)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  {m.platillos && m.platillos.length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      {SECCIONES_PLATILLO_ORDEN.map((sec) => {
                        const items = m.platillos!.filter((p) => p.seccion === sec);
                        if (!items.length) return null;
                        return (
                          <div key={sec} className="mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {SECCION_PLATILLO_LABELS[sec]}
                            </p>
                            <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                              {items.map((p, idx) => (
                                <li key={p.id ?? idx}>
                                  {p.nombre}
                                  {p.descripcion ? (
                                    <span className="text-slate-500"> — {p.descripcion}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
