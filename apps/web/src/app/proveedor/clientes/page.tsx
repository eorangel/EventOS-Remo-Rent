'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiDownload, apiFetch, apiUploadForm } from '@/lib/api';
import type { ClienteProveedor, ResultadoImportacionClientes } from '@/lib/types';

export default function ProveedorClientesPage() {
  const [clientes, setClientes] = useState<ClienteProveedor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archivoExcel, setArchivoExcel] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ResultadoImportacionClientes | null>(null);
  const [importResult, setImportResult] = useState<ResultadoImportacionClientes | null>(null);
  const [importando, setImportando] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    notas: '',
  });

  async function cargar(q?: string) {
    const params = q ? `?search=${encodeURIComponent(q)}` : '';
    const data = await apiFetch<ClienteProveedor[]>(`/portal/clientes${params}`);
    setClientes(data);
  }

  useEffect(() => {
    cargar(search).finally(() => setLoading(false));
  }, [search]);

  async function crearCliente(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/portal/clientes', {
        method: 'POST',
        body: JSON.stringify({
          nombre: form.nombre,
          empresa: form.empresa || undefined,
          email: form.email || undefined,
          telefono: form.telefono || undefined,
          notas: form.notas || undefined,
        }),
      });
      setForm({ nombre: '', empresa: '', email: '', telefono: '', notas: '' });
      await cargar(search);
    } finally {
      setSaving(false);
    }
  }

  async function descargarPlantilla() {
    await apiDownload('/portal/clientes/plantilla-excel', 'plantilla-clientes-proveedor.xlsx');
  }

  async function procesarArchivoExcel(file: File, vistaPrevia: boolean) {
    const formData = new FormData();
    formData.append('archivo', file);
    const query = vistaPrevia ? '?vistaPrevia=true' : '';
    return apiUploadForm<ResultadoImportacionClientes>(
      `/portal/clientes/importar-excel${query}`,
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
      await cargar(search);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al importar');
    } finally {
      setImportando(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Mis clientes"
        description="CRM — contactos, seguimiento, eventos e historial"
        action={
          <Link href="/proveedor/calendario">
            <Button variant="secondary">Ver calendario</Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Importar desde Excel</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sube tu lista actual de clientes. Columnas: Nombre, Empresa, Correo, Teléfono, Notas.
                Si el correo o nombre ya existe, se actualiza el registro.
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
              {importPreview.invalidas > 0 && (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-amber-800">
                  {importPreview.filas
                    .filter((f) => !f.valido)
                    .slice(0, 10)
                    .map((f) => (
                      <li key={f.fila}>
                        Fila {f.fila}: {f.errores.join('; ')}
                      </li>
                    ))}
                  {importPreview.invalidas > 10 && (
                    <li>… y {importPreview.invalidas - 10} filas más con errores</li>
                  )}
                </ul>
              )}
              <Button
                type="button"
                className="mt-3"
                disabled={importando || importPreview.validas === 0}
                onClick={confirmarImportacionExcel}
              >
                Confirmar importación
              </Button>
            </div>
          )}

          {importResult && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Importación completada: {importResult.creados ?? 0} nuevos · {importResult.actualizados ?? 0}{' '}
              actualizados
            </div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold">Nuevo cliente</h2>
            <form onSubmit={crearCliente} className="space-y-3">
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Empresa</label>
                <input
                  value={form.empresa}
                  onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="w-full text-sm"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Agregar cliente'}
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Listado</h2>
              <input
                type="search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs text-sm"
              />
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Cargando clientes...</p>
            ) : clientes.length === 0 ? (
              <p className="text-sm text-slate-500">Sin clientes registrados</p>
            ) : (
              <div className="space-y-3">
                {clientes.map((cliente) => (
                  <Link
                    key={cliente.id}
                    href={`/proveedor/clientes/${cliente.id}`}
                    className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:border-teal-300 hover:bg-teal-50/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{cliente.nombre}</p>
                        {cliente.empresa && (
                          <p className="text-sm text-slate-500">{cliente.empresa}</p>
                        )}
                        <p className="mt-1 text-sm text-slate-600">
                          {[cliente.email, cliente.telefono].filter(Boolean).join(' · ') || 'Sin contacto'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge className="bg-blue-50 text-blue-800">
                            {cliente._count?.eventos ?? 0} eventos
                          </Badge>
                          <Badge className="bg-violet-50 text-violet-800">
                            {cliente._count?.seguimientos ?? 0} pendientes
                          </Badge>
                        </div>
                      </div>
                      <Badge className={cliente.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
