import { toNumber } from '../common/utils/pricing';
import type { BriefingAgendaData } from './briefing.utils';

export type CopilotoPrioridadTipo =
  | 'COBRO_VENCIDO'
  | 'COBRO_HOY'
  | 'ENTREGA'
  | 'RECOGIDA'
  | 'EVENTO'
  | 'SEGUIMIENTO'
  | 'COTIZACION'
  | 'PERFIL';

export type CopilotoPrioridad = {
  id: string;
  tipo: CopilotoPrioridadTipo;
  titulo: string;
  descripcion?: string;
  enlace: string;
  urgencia: 'alta' | 'media' | 'baja';
};

export type CopilotoAccionRapida = {
  id: string;
  label: string;
  enlace: string;
};

export type CopilotoInicio = {
  saludo: string;
  mensaje: string;
  fecha: string;
  nombreUsuario: string;
  nombreEmpresa: string;
  resumenDia: {
    entregas: number;
    recogidas: number;
    eventos: number;
    cobros: number;
    seguimientos: number;
    cobrosVencidos: number;
  };
  prioridades: CopilotoPrioridad[];
  accionesRapidas: CopilotoAccionRapida[];
  vacio: boolean;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}

export function saludoPorHorario(nombre: string, fecha = new Date()): string {
  const hora = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Mexico_City',
      hour: 'numeric',
      hour12: false,
    }).format(fecha),
  );
  const primerNombre = nombre.trim().split(/\s+/)[0] || nombre.trim() || 'equipo';
  if (hora >= 5 && hora < 12) return `Buenos días, ${primerNombre}`;
  if (hora >= 12 && hora < 19) return `Buenas tardes, ${primerNombre}`;
  return `Buenas noches, ${primerNombre}`;
}

function plural(n: number, uno: string, muchos: string) {
  return n === 1 ? `1 ${uno}` : `${n} ${muchos}`;
}

export function buildCopilotoInicio(input: {
  nombreUsuario: string;
  nombreEmpresa: string;
  fecha: string;
  agenda: BriefingAgendaData;
  completitudPerfil: number;
  cotizacionesSinRespuesta: number;
}): CopilotoInicio {
  const { nombreUsuario, nombreEmpresa, fecha, agenda, completitudPerfil, cotizacionesSinRespuesta } =
    input;

  const idsCobrosHoy = new Set(agenda.secciones.cobros.map((c) => c.id));
  const cobrosVencidos = agenda.secciones.pagosPendientes.filter(
    (c) => c.vencido && !idsCobrosHoy.has(c.id),
  );

  const resumenDia = {
    entregas: agenda.resumen.entregas,
    recogidas: agenda.resumen.recogidas,
    eventos: agenda.resumen.eventos,
    cobros: agenda.resumen.cobros,
    seguimientos: agenda.resumen.seguimientos,
    cobrosVencidos: cobrosVencidos.length,
  };

  const prioridades: CopilotoPrioridad[] = [];

  for (const cobro of cobrosVencidos.slice(0, 3)) {
    prioridades.push({
      id: `vencido-${cobro.id}`,
      tipo: 'COBRO_VENCIDO',
      titulo: cobro.titulo,
      descripcion: `${cobro.clienteNombre}${cobro.monto != null ? ` · ${formatMoney(cobro.monto)}` : ''}`,
      enlace: cobro.enlace ?? '/proveedor/cobros',
      urgencia: 'alta',
    });
  }

  for (const cobro of agenda.secciones.cobros.slice(0, 2)) {
    prioridades.push({
      id: `cobro-hoy-${cobro.id}`,
      tipo: 'COBRO_HOY',
      titulo: `Cobro que vence hoy: ${cobro.titulo}`,
      descripcion: `${cobro.clienteNombre}${cobro.monto != null ? ` · ${formatMoney(toNumber(cobro.monto))}` : ''}`,
      enlace: cobro.enlace ?? '/proveedor/cobros',
      urgencia: 'alta',
    });
  }

  for (const entrega of agenda.secciones.entregas.slice(0, 2)) {
    prioridades.push({
      id: `entrega-${entrega.id}`,
      tipo: 'ENTREGA',
      titulo: entrega.titulo,
      descripcion: entrega.clienteNombre,
      enlace: entrega.enlace ?? '/proveedor/calendario',
      urgencia: 'media',
    });
  }

  for (const recogida of agenda.secciones.recogidas.slice(0, 1)) {
    prioridades.push({
      id: `recogida-${recogida.id}`,
      tipo: 'RECOGIDA',
      titulo: `Recogida: ${recogida.titulo}`,
      descripcion: recogida.clienteNombre,
      enlace: recogida.enlace ?? '/proveedor/calendario',
      urgencia: 'media',
    });
  }

  for (const seg of agenda.secciones.seguimientos.slice(0, 2)) {
    prioridades.push({
      id: `seg-${seg.id}`,
      tipo: 'SEGUIMIENTO',
      titulo: seg.titulo,
      descripcion: seg.clienteNombre,
      enlace: seg.enlace ?? '/proveedor/clientes',
      urgencia: 'media',
    });
  }

  if (cotizacionesSinRespuesta > 0) {
    prioridades.push({
      id: 'cotizaciones-sin-respuesta',
      tipo: 'COTIZACION',
      titulo: plural(cotizacionesSinRespuesta, 'cotización sin respuesta', 'cotizaciones sin respuesta'),
      descripcion: 'Enviadas hace más de 7 días — conviene dar seguimiento',
      enlace: '/proveedor/cotizaciones',
      urgencia: 'media',
    });
  }

  if (completitudPerfil < 80) {
    prioridades.push({
      id: 'perfil-incompleto',
      tipo: 'PERFIL',
      titulo: `Perfil al ${completitudPerfil}%`,
      descripcion: 'Completa tu perfil para generar más confianza con clientes',
      enlace: '/proveedor/configuracion',
      urgencia: 'baja',
    });
  }

  const ordenUrgencia = { alta: 0, media: 1, baja: 2 };
  const prioridadesOrdenadas = prioridades
    .sort((a, b) => ordenUrgencia[a.urgencia] - ordenUrgencia[b.urgencia])
    .slice(0, 6);

  const partes: string[] = [];
  if (resumenDia.entregas > 0) partes.push(plural(resumenDia.entregas, 'entrega', 'entregas'));
  if (resumenDia.recogidas > 0) partes.push(plural(resumenDia.recogidas, 'recogida', 'recogidas'));
  if (resumenDia.eventos > 0) partes.push(plural(resumenDia.eventos, 'evento', 'eventos'));
  if (resumenDia.cobros > 0) {
    partes.push(plural(resumenDia.cobros, 'cobro que vence hoy', 'cobros que vencen hoy'));
  }
  if (resumenDia.seguimientos > 0) {
    partes.push(plural(resumenDia.seguimientos, 'seguimiento', 'seguimientos'));
  }
  if (resumenDia.cobrosVencidos > 0) {
    partes.push(plural(resumenDia.cobrosVencidos, 'cobro vencido', 'cobros vencidos'));
  }

  const vacio = partes.length === 0 && prioridadesOrdenadas.length === 0;

  let mensaje: string;
  if (vacio && completitudPerfil >= 80) {
    mensaje = 'Hoy no tienes entregas, cobros ni seguimientos programados. ¡Buen día para planear!';
  } else if (vacio) {
    mensaje = 'Tu agenda de hoy está tranquila. Puedes avanzar en tu perfil o revisar cotizaciones.';
  } else if (partes.length === 1) {
    mensaje = `Hoy tienes ${partes[0]}.`;
  } else if (partes.length === 2) {
    mensaje = `Hoy tienes ${partes[0]} y ${partes[1]}.`;
  } else {
    const ultimo = partes.pop();
    mensaje = `Hoy tienes ${partes.join(', ')} y ${ultimo}.`;
  }

  const accionesRapidas: CopilotoAccionRapida[] = [
    { id: 'calendario', label: 'Ver agenda de hoy', enlace: '/proveedor/calendario' },
    { id: 'cobros', label: 'Cobros pendientes', enlace: '/proveedor/cobros' },
    { id: 'cotizacion', label: 'Nueva cotización', enlace: '/proveedor/cotizaciones/nueva' },
    { id: 'clientes', label: 'Mis clientes', enlace: '/proveedor/clientes' },
  ];

  return {
    saludo: saludoPorHorario(nombreUsuario),
    mensaje,
    fecha,
    nombreUsuario,
    nombreEmpresa,
    resumenDia,
    prioridades: prioridadesOrdenadas,
    accionesRapidas,
    vacio,
  };
}
