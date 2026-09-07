'use client';

import {
  splitVariablesText,
  TIPO_SERVICIO_CONTRATO_PREVIEW,
  type VariablesContrato,
} from '@/lib/contrato-proveedor';
import type { PerfilEmpresaResponse, SeccionContrato, TipoServicioContrato } from '@/lib/types';

type Props = {
  nombre: string;
  tipoServicio: TipoServicioContrato;
  secciones: SeccionContrato[];
  variables: VariablesContrato;
  proveedor?: PerfilEmpresaResponse['proveedor'];
  perfil?: PerfilEmpresaResponse['perfil'];
  activeSeccionId?: string | null;
  onSeccionClick?: (id: string) => void;
};

function TextoConVariables({
  texto,
  variables,
}: {
  texto: string;
  variables: VariablesContrato;
}) {
  const parts = splitVariablesText(texto, variables);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.kind === 'text') {
          return <span key={idx}>{part.text}</span>;
        }
        if (part.value) {
          return (
            <span key={idx} className="font-medium text-teal-800">
              {part.value}
            </span>
          );
        }
        return (
          <span
            key={idx}
            className="mx-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
            title={`Campo: ${part.key.replace(/_/g, ' ')}`}
          >
            {part.key.replace(/_/g, ' ')}
          </span>
        );
      })}
    </>
  );
}

function CampoPreview({ label, value }: { label: string; value?: string | null }) {
  if (value?.trim()) {
    return <p className="text-sm text-slate-800">{value}</p>;
  }
  return (
    <p className="text-sm">
      <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
        {label}
      </span>
    </p>
  );
}

export function ContratoPreview({
  nombre,
  tipoServicio,
  secciones,
  variables,
  proveedor,
  perfil,
  activeSeccionId,
  onSeccionClick,
}: Props) {
  const emitidaEl = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date());
  const proveedorNombre = variables.proveedor_nombre ?? proveedor?.nombre ?? 'Tu empresa';
  const contactoProveedor = [proveedor?.email, proveedor?.telefono, proveedor?.direccion]
    .filter(Boolean)
    .join(' · ');

  const seccionesOrdenadas = [...secciones].sort((a, b) => a.orden - b.orden);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Vista previa del contrato
        </p>
      </div>

      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5 text-[11px] leading-relaxed text-slate-800 sm:p-6 sm:text-xs">
        <header className="mb-5 flex flex-col gap-4 border-b-2 border-teal-600 pb-4 sm:flex-row sm:justify-between">
          <div>
            {perfil?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={perfil.logoUrl}
                alt="Logo"
                className="mb-2 max-h-12 max-w-[140px] object-contain"
              />
            ) : null}
            <p className="text-base font-semibold text-teal-700">{proveedorNombre}</p>
            {proveedor?.razonSocial ? (
              <p className="text-[10px] text-slate-500">{proveedor.razonSocial}</p>
            ) : null}
            {variables.proveedor_rfc || proveedor?.rfc ? (
              <p className="text-[10px] text-slate-500">
                RFC: {variables.proveedor_rfc ?? proveedor?.rfc}
              </p>
            ) : null}
            {contactoProveedor ? (
              <p className="text-[10px] text-slate-500">{contactoProveedor}</p>
            ) : null}
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold text-slate-900">Contrato de servicios</p>
            <p className="text-xs font-semibold text-teal-600">
              {TIPO_SERVICIO_CONTRATO_PREVIEW[tipoServicio]}
            </p>
            <p className="text-[10px] text-slate-500">Generado el {emitidaEl}</p>
          </div>
        </header>

        <h1 className="mb-5 text-center text-sm font-bold text-slate-900 sm:text-base">
          {nombre.trim() || 'Nombre del contrato'}
        </h1>

        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Proveedor
            </p>
            <p className="text-sm font-semibold text-slate-900">{proveedorNombre}</p>
            {(variables.proveedor_rfc || proveedor?.rfc) && (
              <p className="text-[10px] text-slate-600">
                RFC: {variables.proveedor_rfc ?? proveedor?.rfc}
              </p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Cliente
            </p>
            <CampoPreview label="nombre del cliente" value={variables.cliente_nombre} />
            {variables.cliente_empresa ? (
              <p className="text-sm text-slate-700">{variables.cliente_empresa}</p>
            ) : null}
            {variables.cliente_email ? (
              <p className="text-[10px] text-slate-600">{variables.cliente_email}</p>
            ) : null}
            {variables.cliente_telefono ? (
              <p className="text-[10px] text-slate-600">{variables.cliente_telefono}</p>
            ) : null}
          </div>
        </section>

        {seccionesOrdenadas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              Las cláusulas del contrato aparecerán aquí conforme las vayas editando.
            </p>
          </div>
        ) : (
          seccionesOrdenadas.map((sec, index) => {
            const isActive = activeSeccionId === sec.id;
            return (
              <section
                key={sec.id}
                id={`preview-${sec.id}`}
                role="button"
                tabIndex={0}
                onClick={() => onSeccionClick?.(sec.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSeccionClick?.(sec.id);
                  }
                }}
                className={`mb-4 cursor-pointer rounded-lg p-2 transition ${
                  isActive
                    ? 'bg-teal-50 ring-2 ring-teal-500 ring-offset-1'
                    : 'hover:bg-slate-50'
                }`}
              >
                <h2 className="mb-1 text-xs font-semibold text-teal-700">
                  {index + 1}.{' '}
                  <TextoConVariables texto={sec.titulo || 'Sin título'} variables={variables} />
                </h2>
                {sec.contenido.split('\n').map((line, lineIdx) =>
                  line.trim() ? (
                    <p key={lineIdx} className="mb-1 text-justify text-slate-700">
                      <TextoConVariables texto={line} variables={variables} />
                    </p>
                  ) : null,
                )}
              </section>
            );
          })
        )}

        {perfil?.politicasRenta ? (
          <section className="mb-4 border-t border-dashed border-slate-300 pt-3">
            <h2 className="mb-1 text-xs font-semibold text-slate-600">Anexo — Políticas de renta</h2>
            <p className="whitespace-pre-wrap text-slate-700">{perfil.politicasRenta}</p>
          </section>
        ) : null}

        {perfil?.condicionesCancelacion ? (
          <section className="mb-4 border-t border-dashed border-slate-300 pt-3">
            <h2 className="mb-1 text-xs font-semibold text-slate-600">
              Anexo — Condiciones de cancelación
            </h2>
            <p className="whitespace-pre-wrap text-slate-700">{perfil.condicionesCancelacion}</p>
          </section>
        ) : null}

        <section className="mt-6 grid grid-cols-2 gap-6 border-t border-slate-200 pt-4">
          <div className="text-center">
            <div className="mx-4 mb-2 border-t border-slate-700 pt-8" />
            <p className="text-xs font-medium">{proveedorNombre}</p>
            <p className="text-[10px] text-slate-500">Proveedor</p>
          </div>
          <div className="text-center">
            <div className="mx-4 mb-2 border-t border-slate-700 pt-8" />
            {variables.cliente_nombre ? (
              <p className="text-xs font-medium">{variables.cliente_nombre}</p>
            ) : (
              <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                nombre del cliente
              </span>
            )}
            <p className="text-[10px] text-slate-500">Cliente</p>
          </div>
        </section>
      </div>
    </div>
  );
}
