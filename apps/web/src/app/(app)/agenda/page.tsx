'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  TIPO_ACTIVIDAD_COLORS,
  TIPO_ACTIVIDAD_LABELS,
  formatFecha,
} from '@/lib/labels';
import type { ActividadAgenda } from '@/lib/types';

function inicioSemana(fecha: Date) {
  const d = new Date(fecha);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function finSemana(inicio: Date) {
  const f = new Date(inicio);
  f.setDate(f.getDate() + 6);
  f.setHours(23, 59, 59, 999);
  return f;
}

export default function AgendaPage() {
  const [actividades, setActividades] = useState<ActividadAgenda[]>([]);
  const [semanaBase, setSemanaBase] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const inicio = inicioSemana(semanaBase);
  const fin = finSemana(inicio);

  useEffect(() => {
    setLoading(true);
    apiFetch<ActividadAgenda[]>(
      `/agenda?desde=${inicio.toISOString()}&hasta=${fin.toISOString()}`,
    )
      .then(setActividades)
      .finally(() => setLoading(false));
  }, [semanaBase]);

  function cambiarSemana(delta: number) {
    const d = new Date(semanaBase);
    d.setDate(d.getDate() + delta * 7);
    setSemanaBase(d);
  }

  async function toggleActividad(id: string) {
    const updated = await apiFetch<ActividadAgenda>(`/agenda/${id}/toggle`, {
      method: 'PATCH',
    });
    setActividades((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  const porDia = actividades.reduce<Record<string, ActividadAgenda[]>>((acc, act) => {
    const key = new Date(act.fechaInicio).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Calendario de montajes, eventos, desmontajes y entregas"
      />

      <div className="mb-6 flex items-center justify-between">
        <Button variant="secondary" onClick={() => cambiarSemana(-1)}>
          ← Semana anterior
        </Button>
        <p className="text-sm font-medium text-slate-700">
          {inicio.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} —{' '}
          {fin.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <Button variant="secondary" onClick={() => cambiarSemana(1)}>
          Semana siguiente →
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando agenda...</p>
      ) : Object.keys(porDia).length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No hay actividades programadas esta semana.</p>
          <Link href="/eventos" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
            Ver eventos
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(porDia).map(([dia, acts]) => (
            <Card key={dia}>
              <h2 className="mb-4 text-lg font-semibold capitalize text-slate-900">{dia}</h2>
              <div className="space-y-3">
                {acts.map((act) => (
                  <div
                    key={act.id}
                    className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 ${
                      act.completada ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={TIPO_ACTIVIDAD_COLORS[act.tipo]}>
                          {TIPO_ACTIVIDAD_LABELS[act.tipo]}
                        </Badge>
                        <p className="font-medium text-slate-900">{act.titulo}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatFecha(act.fechaInicio)}
                        {act.lugar ? ` · ${act.lugar}` : ''}
                      </p>
                      {act.evento && (
                        <Link
                          href={`/eventos/${act.eventoId}`}
                          className="mt-1 inline-block text-xs text-brand-600 hover:underline"
                        >
                          {act.evento.cliente?.nombre}
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => toggleActividad(act.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        act.completada
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {act.completada ? 'Completada' : 'Marcar hecha'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
