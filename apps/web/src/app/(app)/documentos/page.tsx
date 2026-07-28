'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import {
  TIPO_DOCUMENTO_COLORS,
  TIPO_DOCUMENTO_LABELS,
  formatFecha,
} from '@/lib/labels';
import type { Documento, TipoDocumento } from '@/lib/types';

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Documento[]>('/documentos')
      .then(setDocumentos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Documentos"
        description="Cotizaciones, contratos, recibos y actas de entrega"
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando documentos...</p>
      ) : documentos.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            No hay documentos generados. Créalos desde el detalle del evento.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <Card key={doc.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{doc.titulo}</p>
                  <p className="text-sm text-slate-500">
                    {doc.evento?.titulo} · {doc.evento?.cliente?.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    {doc.folio ?? 'Sin folio'} · {formatFecha(doc.generadoEn)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={TIPO_DOCUMENTO_COLORS[doc.tipo]}>
                    {TIPO_DOCUMENTO_LABELS[doc.tipo]}
                  </Badge>
                  <Link href={`/documentos/${doc.id}`}>
                    <Button variant="secondary">Ver / Imprimir</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
