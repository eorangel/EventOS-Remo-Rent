'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { TIPO_DOCUMENTO_COLORS, TIPO_DOCUMENTO_LABELS, formatFecha } from '@/lib/labels';
import type { Documento } from '@/lib/types';

export default function DocumentoDetallePage() {
  const params = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<Documento>(`/documentos/${params.id}`)
      .then(setDoc)
      .finally(() => setLoading(false));
  }, [params.id]);

  function imprimir() {
    const ventana = window.open('', '_blank');
    if (!ventana || !doc?.contenido) return;
    ventana.document.write(doc.contenido);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  return (
    <>
      <PageHeader
        title={doc?.titulo ?? 'Documento'}
        description={doc?.folio ?? 'Detalle del documento'}
        action={
          <div className="flex gap-2">
            <Link href="/documentos">
              <Button variant="secondary">← Documentos</Button>
            </Link>
            {doc?.contenido && (
              <Button onClick={imprimir}>Imprimir / PDF</Button>
            )}
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando documento...</p>
      ) : !doc ? (
        <p className="text-sm text-red-600">Documento no encontrado</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className={TIPO_DOCUMENTO_COLORS[doc.tipo]}>
                {TIPO_DOCUMENTO_LABELS[doc.tipo]}
              </Badge>
              <span className="text-sm text-slate-500">
                {doc.evento?.titulo} · Generado {formatFecha(doc.generadoEn)}
              </span>
            </div>
            {doc.contenido ? (
              <div
                className="prose prose-slate max-w-none rounded-xl border border-slate-200 bg-white p-6"
                dangerouslySetInnerHTML={{ __html: doc.contenido }}
              />
            ) : (
              <p className="text-sm text-slate-500">Este documento no tiene contenido.</p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
