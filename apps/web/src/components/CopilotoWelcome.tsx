'use client';

import Link from 'next/link';
import { Badge, Button, Card } from '@/components/ui';
import type { CopilotoInicio, CopilotoPrioridad } from '@/lib/types';

const URGENCIA_STYLES: Record<CopilotoPrioridad['urgencia'], string> = {
  alta: 'border-red-200 bg-red-50/80',
  media: 'border-amber-200 bg-amber-50/60',
  baja: 'border-slate-200 bg-slate-50',
};

const TIPO_LABELS: Record<CopilotoPrioridad['tipo'], string> = {
  COBRO_VENCIDO: 'Cobro vencido',
  COBRO_HOY: 'Cobro hoy',
  ENTREGA: 'Entrega',
  RECOGIDA: 'Recogida',
  EVENTO: 'Evento',
  SEGUIMIENTO: 'Seguimiento',
  COTIZACION: 'Cotización',
  PERFIL: 'Perfil',
};

type Props = {
  data: CopilotoInicio;
};

export function CopilotoWelcome({ data }: Props) {
  const { saludo, mensaje, resumenDia, prioridades, accionesRapidas, vacio } = data;
  const hayActividad =
    resumenDia.entregas +
      resumenDia.recogidas +
      resumenDia.eventos +
      resumenDia.cobros +
      resumenDia.seguimientos +
      resumenDia.cobrosVencidos >
    0;

  return (
    <Card className="overflow-hidden border-teal-200/80 bg-gradient-to-br from-teal-50 via-white to-emerald-50/40 p-0 shadow-sm">
      <div className="border-b border-teal-100/80 bg-teal-900/5 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700/80">
              Remo Copiloto
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{saludo}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{mensaje}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-xl text-white shadow-md">
            ◫
          </div>
        </div>

        {hayActividad && (
          <div className="mt-4 flex flex-wrap gap-2">
            {resumenDia.entregas > 0 && (
              <Badge className="bg-white/80 text-teal-800 ring-1 ring-teal-200">
                {resumenDia.entregas} entregas
              </Badge>
            )}
            {resumenDia.recogidas > 0 && (
              <Badge className="bg-white/80 text-teal-800 ring-1 ring-teal-200">
                {resumenDia.recogidas} recogidas
              </Badge>
            )}
            {resumenDia.eventos > 0 && (
              <Badge className="bg-white/80 text-teal-800 ring-1 ring-teal-200">
                {resumenDia.eventos} eventos
              </Badge>
            )}
            {resumenDia.cobros > 0 && (
              <Badge className="bg-white/80 text-amber-800 ring-1 ring-amber-200">
                {resumenDia.cobros} cobros hoy
              </Badge>
            )}
            {resumenDia.seguimientos > 0 && (
              <Badge className="bg-white/80 text-violet-800 ring-1 ring-violet-200">
                {resumenDia.seguimientos} seguimientos
              </Badge>
            )}
            {resumenDia.cobrosVencidos > 0 && (
              <Badge className="bg-red-100 text-red-800 ring-1 ring-red-200">
                {resumenDia.cobrosVencidos} vencidos
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {accionesRapidas.map((accion) => (
            <Link key={accion.id} href={accion.enlace}>
              <Button type="button" variant="secondary" className="text-sm">
                {accion.label}
              </Button>
            </Link>
          ))}
        </div>

        {prioridades.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Prioridades sugeridas</h3>
            <div className="space-y-2">
              {prioridades.map((item) => (
                <Link
                  key={item.id}
                  href={item.enlace}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 transition hover:shadow-sm ${URGENCIA_STYLES[item.urgencia]}`}
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge className="bg-white/90 text-xs text-slate-600">
                        {TIPO_LABELS[item.tipo]}
                      </Badge>
                      {item.urgencia === 'alta' && (
                        <span className="text-xs font-medium text-red-700">Urgente</span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900">{item.titulo}</p>
                    {item.descripcion && (
                      <p className="mt-0.5 text-sm text-slate-600">{item.descripcion}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-teal-700">Ver →</span>
                </Link>
              ))}
            </div>
          </div>
        ) : vacio ? (
          <p className="text-sm text-slate-500">
            No hay pendientes urgentes. Usa las acciones rápidas para avanzar en tu operación.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
