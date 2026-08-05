'use client';

import { useEffect, useState } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { apiDownload, apiFetch, apiUploadForm } from '@/lib/api';
import {
  CATEGORIAS_CATALOGO,
  UNIDAD_MEDIDA_LABELS,
  formatMoney,
} from '@/lib/labels';
import type {
  ProductoProveedor,
  ProductoProveedorInventario,
  ResultadoImportacionProductos,
  UnidadMedidaProducto,
} from '@/lib/types';
import { rangoFechaConsulta } from '@/lib/cotizacion-proveedor';

export default function ProveedorCatalogoPage() {
  const [productos, setProductos] = useState<ProductoProveedorInventario[]>([]);
  const [fechaConsulta, setFechaConsulta] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ResultadoImportacionProductos | null>(null);
  const [importResult, setImportResult] = useState<ResultadoImportacionProductos | null>(null);
  const [importando, setImportando] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    categoria: 'Sillas',
    cantidadDisponible: '',
    precioReferencia: '',
    descripcion: '',
    unidadMedida: 'PIEZA' as UnidadMedidaProducto,
  });

  async function cargar() {
    if (fechaConsulta) {
      const { fechaInicio, fechaFin } = rangoFechaConsulta(fechaConsulta);
      const data = await apiFetch<ProductoProveedorInventario[]>(
        `/portal/productos/disponibilidad?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`,
      );
      setProductos(data);
      return;
    }
    const data = await apiFetch<ProductoProveedor[]>('/portal/productos');
    setProductos(
      data.map((p) => ({
        ...p,
        cantidadTotal: p.cantidadDisponible,
        cantidadReservada: 0,
      })),
    );
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [fechaConsulta]);

  async function agregarProducto(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/portal/productos', {
        method: 'POST',
        body: JSON.stringify({
          nombre: form.nombre,
          categoria: form.categoria,
          cantidadDisponible: Number(form.cantidadDisponible) || 0,
          precioReferencia: Number(form.precioReferencia) || 0,
          descripcion: form.descripcion || undefined,
          unidadMedida: form.unidadMedida,
        }),
      });
      setForm({
        nombre: '',
        categoria: 'Sillas',
        cantidadDisponible: '',
        precioReferencia: '',
        descripcion: '',
        unidadMedida: 'PIEZA',
      });
      await cargar();
    } finally {
      setSaving(false);
    }
  }

  async function descargarPlantilla() {
    await apiDownload('/portal/productos/plantilla-excel', 'plantilla-inventario-proveedor.xlsx');
  }

  async function procesarArchivoExcel(file: File, vistaPrevia: boolean) {
    const formData = new FormData();
    formData.append('archivo', file);
    const query = vistaPrevia ? '?vistaPrevia=true' : '';
    return apiUploadForm<ResultadoImportacionProductos>(
      `/portal/productos/importar-excel${query}`,
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

  return (
    <>
      <PageHeader
        title="Mi catálogo"
        description="Inventario total y disponibilidad por fecha — evita sobreventas"
      />

      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Importar desde Excel</h2>
              <p className="mt-1 text-sm text-slate-500">
                Columnas: Nombre, Categoría, Cantidad, Precio referencia, Unidad, Descripción, URL foto.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={descargarPlantilla}>
                Descargar plantilla
              </Button>
              <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {importando ? 'Procesando...' : 'Seleccionar archivo'}
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onSeleccionarExcel} />
              </label>
            </div>
          </div>

          {importPreview && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-900">
                Vista previa: {importPreview.validas} válidas · {importPreview.invalidas} con errores
              </p>
              <Button type="button" className="mt-3" disabled={importando || importPreview.validas === 0} onClick={confirmarImportacionExcel}>
                Confirmar importación
              </Button>
            </div>
          )}

          {importResult && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Importados: {(importResult.creados ?? 0) + (importResult.actualizados ?? 0)} producto(s)
            </div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold">Agregar producto</h2>
            <form onSubmit={agregarProducto} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full text-sm"
                >
                  {CATEGORIAS_CATALOGO.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Inventario total
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej. 100"
                    value={form.cantidadDisponible}
                    onChange={(e) => setForm({ ...form, cantidadDisponible: e.target.value })}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Precio ref.</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precioReferencia}
                    onChange={(e) => setForm({ ...form, precioReferencia: e.target.value })}
                    className="w-full text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Unidad</label>
                <select
                  value={form.unidadMedida}
                  onChange={(e) =>
                    setForm({ ...form, unidadMedida: e.target.value as UnidadMedidaProducto })
                  }
                  className="w-full text-sm"
                >
                  {(Object.keys(UNIDAD_MEDIDA_LABELS) as UnidadMedidaProducto[]).map((u) => (
                    <option key={u} value={u}>{UNIDAD_MEDIDA_LABELS[u]}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Agregar'}
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-lg font-semibold">Productos ({productos.length})</h2>
              <label className="text-sm">
                <span className="mb-1 block text-slate-600">Disponibilidad en fecha</span>
                <input
                  type="date"
                  value={fechaConsulta}
                  onChange={(e) => {
                    setLoading(true);
                    setFechaConsulta(e.target.value);
                  }}
                  className="text-sm"
                />
              </label>
            </div>
            {fechaConsulta && (
              <p className="mb-4 text-xs text-teal-700">
                Incluye cotizaciones en borrador, enviadas y aprobadas para esa fecha.
              </p>
            )}
            {loading ? (
              <p className="text-sm text-slate-500">Cargando catálogo...</p>
            ) : productos.length === 0 ? (
              <p className="text-sm text-slate-500">Sin productos en catálogo</p>
            ) : (
              <div className="space-y-3">
                {productos.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{p.nombre}</p>
                        <p className="text-sm text-slate-500">
                          {p.categoria ?? 'Sin categoría'} ·{' '}
                          {fechaConsulta ? (
                            <>
                              <span className="font-medium text-teal-700">
                                {p.cantidadDisponible} disponibles
                              </span>
                              {' · '}
                              {p.cantidadReservada ?? 0} rentadas · {p.cantidadTotal ?? p.cantidadDisponible}{' '}
                              total
                            </>
                          ) : (
                            <>
                              {p.cantidadTotal ?? p.cantidadDisponible}{' '}
                              {UNIDAD_MEDIDA_LABELS[p.unidadMedida ?? 'PIEZA']} en inventario
                            </>
                          )}
                        </p>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(p.precioReferencia)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
