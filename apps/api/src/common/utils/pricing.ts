import { Decimal } from '@prisma/client/runtime/library';

export function calcPrecioVenta(costo: number, margenPorcentaje: number): number {
  return roundMoney(costo * (1 + margenPorcentaje / 100));
}

export function calcSubtotal(precioUnitario: number, cantidad: number): number {
  return roundMoney(precioUnitario * cantidad);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toNumber(value: Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export async function generarFolio(
  prisma: { cotizacion: { count: (args?: object) => Promise<number> } },
): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.cotizacion.count({
    where: {
      folio: { startsWith: `COT-${year}-` },
    },
  });
  return `COT-${year}-${String(count + 1).padStart(3, '0')}`;
}

export function eventosSeTraslapan(
  inicioA: Date,
  finA: Date,
  inicioB: Date,
  finB: Date,
): boolean {
  return inicioA <= finB && inicioB <= finA;
}

export function rangoEvento(evento: {
  fechaEvento: Date;
  fechaMontaje: Date | null;
  fechaDesmontaje: Date | null;
}): { inicio: Date; fin: Date } {
  const inicio = evento.fechaMontaje ?? evento.fechaEvento;
  const fin = evento.fechaDesmontaje ?? evento.fechaEvento;
  return { inicio, fin };
}
