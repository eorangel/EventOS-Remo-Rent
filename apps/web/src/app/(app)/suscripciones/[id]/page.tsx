'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_PAGO_SUSCRIPCION_COLORS,
  ESTADO_PAGO_SUSCRIPCION_LABELS,
  ESTADO_SUSCRIPCION_COLORS,
  ESTADO_SUSCRIPCION_LABELS,
  METODO_PAGO_LABELS,
  formatFecha,
  formatMoney,
} from '@/lib/labels';
import type { SuscripcionDetalle } from '@/lib/types';

export default function SuscripcionDetallePage() {
  const params = useParams<{ id: string }>();
  const [suscripcion, setSuscripcion] = useState<SuscripcionDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<SuscripcionDetalle>(`/suscripciones/${params.id}`)
      .then(setSuscripcion)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Cargando suscripción...</p>;
  }

  if (!suscripcion) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Suscripción no encontrada.</p>
        <Link href="/suscripciones" className="text-sm text-brand-700 hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={suscripcion.empresa}
        description={`Plan ${suscripcion.plan} · ${formatMoney(suscripcion.precioMensual)}/mes`}
        action={
          <Link href="/suscripciones">
            <span className="text-sm font-medium text-brand-700 hover:underline">← Suscripciones</span>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge className={ESTADO_SUSCRIPCION_COLORS[suscripcion.estado]}>
          {ESTADO_SUSCRIPCION_LABELS[suscripcion.estado]}
        </Badge>
        {!suscripcion.proveedorActivo && (
          <Badge className="bg-slate-100 text-slate-600">Proveedor inactivo</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Datos de la suscripción</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Empresa</dt>
              <dd>
                <Link
                  href={`/proveedores/${suscripcion.proveedorId}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {suscripcion.empresa}
                </Link>
                {suscripcion.empresaRazonSocial && (
                  <p className="text-slate-600">{suscripcion.empresaRazonSocial}</p>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Plan</dt>
              <dd className="font-medium text-slate-900">{suscripcion.plan}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Fecha de alta</dt>
              <dd className="text-slate-800">{formatFecha(suscripcion.fechaAlta)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Próximo cobro</dt>
              <dd className="text-slate-800">
                {suscripcion.proximoCobro ? formatFecha(suscripcion.proximoCobro) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Método de pago</dt>
              <dd className="text-slate-800">
                {suscripcion.metodoPago ? METODO_PAGO_LABELS[suscripcion.metodoPago] : 'Sin definir'}
                {suscripcion.referenciaPago && (
                  <span className="ml-2 text-slate-500">({suscripcion.referenciaPago})</span>
                )}
              </dd>
            </div>
            {suscripcion.canceladaEn && (
              <div>
                <dt className="text-slate-500">Cancelada</dt>
                <dd className="text-slate-800">{formatFecha(suscripcion.canceladaEn)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Historial de pagos</h3>
          {suscripcion.pagos.length === 0 ? (
            <p className="text-sm text-slate-500">Sin pagos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Fecha</th>
                    <th className="pb-2 pr-4 font-medium">Periodo</th>
                    <th className="pb-2 pr-4 font-medium">Monto</th>
                    <th className="pb-2 pr-4 font-medium">Método</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suscripcion.pagos.map((pago) => (
                    <tr key={pago.id}>
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-700">
                        {formatFecha(pago.pagadoEn)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {formatFecha(pago.periodoInicio)} – {formatFecha(pago.periodoFin)}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {formatMoney(pago.monto)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {METODO_PAGO_LABELS[pago.metodoPago]}
                        {pago.referencia && (
                          <p className="text-xs text-slate-400">{pago.referencia}</p>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge className={ESTADO_PAGO_SUSCRIPCION_COLORS[pago.estado]}>
                          {ESTADO_PAGO_SUSCRIPCION_LABELS[pago.estado]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
