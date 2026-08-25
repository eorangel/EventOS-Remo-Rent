'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  ESTADO_PLANTILLA_CONTRATO_COLORS,
  ESTADO_PLANTILLA_CONTRATO_LABELS,
  MODO_PLANTILLA_CONTRATO_LABELS,
  TIPO_SERVICIO_CONTRATO_LABELS,
} from '@/lib/labels';
import type {
  EstadoPlantillaContrato,
  PlantillaContratoProveedor,
  TipoServicioContrato,
} from '@/lib/types';

export default function ProveedorContratosPage() {
  const [plantillas, setPlantillas] = useState<PlantillaContratoProveedor[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPlantillaContrato | ''>('');
  const [filtroTipo, setFiltroTipo] = useState<TipoServicioContrato | ''>('');
  const [loading, setLoading] = useState(true);

  async function cargar() {
    const params = new URLSearchParams();
    if (filtroEstado) params.set('estado', filtroEstado);
    if (filtroTipo) params.set('tipoServicio', filtroTipo);
    const qs = params.toString();
    const data = await apiFetch<PlantillaContratoProveedor[]>(
      `/portal/contratos${qs ? `?${qs}` : ''}`,
    );
    setPlantillas(data);
  }

  useEffect(() => {
    cargar().finally(() => setLoading(false));
  }, [filtroEstado, filtroTipo]);

  return (
    <>
      <PageHeader
        title="Contratos"
        description="Define plantillas de contrato por tipo de servicio, edítalas o carga un archivo y genera PDF listo para firmar"
        action={
          <Link href="/proveedor/contratos/nueva">
            <Button>+ Nueva plantilla</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Estado
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoPlantillaContrato | '')}
              className="text-sm"
            >
              <option value="">Todos</option>
              {(Object.keys(ESTADO_PLANTILLA_CONTRATO_LABELS) as EstadoPlantillaContrato[]).map(
                (e) => (
                  <option key={e} value={e}>
                    {ESTADO_PLANTILLA_CONTRATO_LABELS[e]}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            Tipo
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoServicioContrato | '')}
              className="text-sm"
            >
              <option value="">Todos</option>
              {(Object.keys(TIPO_SERVICIO_CONTRATO_LABELS) as TipoServicioContrato[]).map((t) => (
                <option key={t} value={t}>
                  {TIPO_SERVICIO_CONTRATO_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando contratos...</p>
      ) : plantillas.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">
            Aún no tienes plantillas de contrato. Crea la primera para renta, banquete o servicios.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {plantillas.map((p) => (
            <Link key={p.id} href={`/proveedor/contratos/${p.id}`}>
              <Card className="transition hover:border-teal-300 hover:shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{p.nombre}</p>
                    <p className="text-sm text-slate-500">
                      {TIPO_SERVICIO_CONTRATO_LABELS[p.tipoServicio]}
                      {p.servicio?.nombre ? ` · ${p.servicio.nombre}` : ''}
                      {p.menu?.nombre ? ` · ${p.menu.nombre}` : ''}
                    </p>
                    {p.descripcion ? (
                      <p className="mt-1 text-sm text-slate-600">{p.descripcion}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={ESTADO_PLANTILLA_CONTRATO_COLORS[p.estado]}>
                      {ESTADO_PLANTILLA_CONTRATO_LABELS[p.estado]}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700">
                      {MODO_PLANTILLA_CONTRATO_LABELS[p.modo]}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
