'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_LOGISTICA_COLORS,
  ESTADO_LOGISTICA_LABELS,
  formatFecha,
} from '@/lib/labels';
import type { EstadoLogistica, Logistica, Vehiculo } from '@/lib/types';

const ESTADOS: EstadoLogistica[] = ['PENDIENTE', 'PROGRAMADA', 'EN_RUTA', 'COMPLETADA'];

export default function LogisticaEventoPage() {
  const params = useParams<{ eventoId: string }>();
  const [logistica, setLogistica] = useState<Logistica | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vehiculoId: '',
    conductor: '',
    equipo: '',
    fechaSalida: '',
    fechaRegreso: '',
    ruta: '',
    notas: '',
  });

  useEffect(() => {
    if (!params.eventoId) return;
    Promise.all([
      apiFetch<Logistica>(`/logistica/evento/${params.eventoId}`).catch(() => null),
      apiFetch<Vehiculo[]>('/vehiculos?activo=true'),
    ]).then(([log, vehs]) => {
      if (log) {
        setLogistica(log);
        setForm({
          vehiculoId: log.vehiculoId ?? '',
          conductor: log.conductor ?? '',
          equipo: log.equipo ?? '',
          fechaSalida: log.fechaSalida ? log.fechaSalida.slice(0, 16) : '',
          fechaRegreso: log.fechaRegreso ? log.fechaRegreso.slice(0, 16) : '',
          ruta: log.ruta ?? '',
          notas: log.notas ?? '',
        });
      }
      setVehiculos(vehs);
    }).finally(() => setLoading(false));
  }, [params.eventoId]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch<Logistica>('/logistica', {
        method: 'POST',
        body: JSON.stringify({ eventoId: params.eventoId, ...form }),
      });
      setLogistica(updated);
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(estado: EstadoLogistica) {
    if (!logistica) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Logistica>(`/logistica/${logistica.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      setLogistica(updated);
    } finally {
      setSaving(false);
    }
  }

  async function toggleChecklist(itemId: string) {
    setSaving(true);
    try {
      const updated = await apiFetch<Logistica>(`/logistica/checklist/${itemId}/toggle`, {
        method: 'PATCH',
      });
      setLogistica(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={logistica?.evento?.titulo ?? 'Logística del evento'}
        description={
          <>
            Evento:{' '}
            <Link href={`/eventos/${params.eventoId}`} className="text-brand-600 hover:underline">
              Ver evento
            </Link>
          </>
        }
        action={
          logistica && (
            <Badge className={ESTADO_LOGISTICA_COLORS[logistica.estado]}>
              {ESTADO_LOGISTICA_LABELS[logistica.estado]}
            </Badge>
          )
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Asignación</h2>
            <form onSubmit={guardar} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Vehículo</label>
                  <select
                    value={form.vehiculoId}
                    onChange={(e) => setForm({ ...form, vehiculoId: e.target.value })}
                    className="w-full"
                  >
                    <option value="">Seleccionar...</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nombre} — {v.placa}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Conductor</label>
                  <input
                    value={form.conductor}
                    onChange={(e) => setForm({ ...form, conductor: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Equipo de montaje</label>
                <input
                  placeholder="Nombres separados por coma"
                  value={form.equipo}
                  onChange={(e) => setForm({ ...form, equipo: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Fecha salida</label>
                  <input
                    type="datetime-local"
                    value={form.fechaSalida}
                    onChange={(e) => setForm({ ...form, fechaSalida: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Fecha regreso</label>
                  <input
                    type="datetime-local"
                    value={form.fechaRegreso}
                    onChange={(e) => setForm({ ...form, fechaRegreso: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Ruta</label>
                <input
                  value={form.ruta}
                  onChange={(e) => setForm({ ...form, ruta: e.target.value })}
                  className="w-full"
                  placeholder="Almacén → Evento → Almacén"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar logística'}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            {logistica && (
              <>
                <Card>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">Estado</h2>
                  <div className="space-y-2">
                    {ESTADOS.map((estado) => (
                      <Button
                        key={estado}
                        variant={logistica.estado === estado ? 'primary' : 'secondary'}
                        disabled={saving || logistica.estado === estado}
                        onClick={() => cambiarEstado(estado)}
                        className="w-full justify-start"
                      >
                        {ESTADO_LOGISTICA_LABELS[estado]}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">Checklist operativo</h2>
                  <div className="space-y-2">
                    {logistica.checklist?.map((item) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={item.completado}
                          onChange={() => toggleChecklist(item.id)}
                          disabled={saving}
                        />
                        <span
                          className={`text-sm ${item.completado ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                        >
                          {item.descripcion}
                        </span>
                      </label>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
