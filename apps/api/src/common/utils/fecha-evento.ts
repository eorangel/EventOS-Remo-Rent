/** Normaliza una fecha de calendario (YYYY-MM-DD o ISO) a mediodía UTC. */
export function parseFechaEventoDia(value: string): Date {
  const day = value.slice(0, 10);
  return new Date(`${day}T12:00:00.000Z`);
}

export function toDateKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function rangoConsultaUTC(fechaDia: string): { inicio: Date; fin: Date } {
  const day = fechaDia.slice(0, 10);
  return {
    inicio: new Date(`${day}T00:00:00.000Z`),
    fin: new Date(`${day}T23:59:59.999Z`),
  };
}

export function rangoDesdeFechasISO(fechaInicio: string, fechaFin: string): {
  inicio: Date;
  fin: Date;
} {
  return {
    inicio: new Date(fechaInicio),
    fin: new Date(fechaFin),
  };
}

/** ¿La fecha del evento cae dentro del rango consultado (por día UTC)? */
export function fechaEventoEnRango(fechaEvento: Date, inicio: Date, fin: Date): boolean {
  const key = toDateKeyUTC(fechaEvento);
  const startKey = toDateKeyUTC(inicio);
  const endKey = toDateKeyUTC(fin);
  return key >= startKey && key <= endKey;
}
