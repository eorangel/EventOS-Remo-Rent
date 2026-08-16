import * as XLSX from 'xlsx';
import { UnidadMedidaProducto } from '@prisma/client';

export interface FilaProductoExcel {
  fila: number;
  nombre: string;
  categoria?: string;
  cantidadDisponible: number;
  precioReferencia: number;
  unidadMedida: UnidadMedidaProducto;
  descripcion?: string;
  fotoUrl?: string;
  errores: string[];
  valido: boolean;
}

const COLUMN_ALIASES: Record<string, string[]> = {
  nombre: ['nombre', 'producto', 'articulo', 'artículo', 'item', 'nombre producto'],
  categoria: ['categoria', 'categoría', 'tipo', 'familia', 'rubro'],
  cantidad: ['cantidad', 'stock', 'existencia', 'disponible', 'cantidad_disponible', 'cantidad disponible', 'existencias'],
  precio: ['precio', 'precio_referencia', 'precio referencia', 'precio ref', 'costo', 'precio unitario', 'precio_unitario'],
  unidad: ['unidad', 'unidad_medida', 'unidad medida', 'udm', 'um'],
  descripcion: ['descripcion', 'descripción', 'detalle', 'notas', 'comentarios'],
  foto: ['foto', 'url_foto', 'url foto', 'imagen', 'url imagen', 'url'],
};

const UNIDAD_MAP: Record<string, UnidadMedidaProducto> = {
  pieza: UnidadMedidaProducto.PIEZA,
  pza: UnidadMedidaProducto.PIEZA,
  pzas: UnidadMedidaProducto.PIEZA,
  unidad: UnidadMedidaProducto.PIEZA,
  metro: UnidadMedidaProducto.METRO,
  m: UnidadMedidaProducto.METRO,
  m2: UnidadMedidaProducto.METRO2,
  metro2: UnidadMedidaProducto.METRO2,
  'metro cuadrado': UnidadMedidaProducto.METRO2,
  paquete: UnidadMedidaProducto.PAQUETE,
  pkg: UnidadMedidaProducto.PAQUETE,
  servicio: UnidadMedidaProducto.SERVICIO,
};

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

function cellValue(row: Record<string, unknown>, field: keyof typeof COLUMN_ALIASES, headerMap: Map<string, string>): unknown {
  const header = headerMap.get(field);
  if (!header) return undefined;
  return row[header];
}

function parseNumber(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[$,\s]/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function parseUnidad(value: unknown): UnidadMedidaProducto {
  if (value == null || value === '') return UnidadMedidaProducto.PIEZA;
  const key = normalizeHeader(value);
  return UNIDAD_MAP[key] ?? UnidadMedidaProducto.PIEZA;
}

function buildHeaderMap(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const header of headers) {
      const norm = normalizeHeader(header);
      if (aliases.includes(norm)) {
        map.set(field, header);
        break;
      }
    }
  }
  return map;
}

function normalizeFotoUrl(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  let url = String(value).trim();
  if (!url) return undefined;
  if (!/^https?:\/\//i.test(url)) {
    if (/^www\./i.test(url) || /^[\w.-]+\.[a-z]{2,}/i.test(url)) {
      url = `https://${url.replace(/^\/\//, '')}`;
    } else {
      return undefined;
    }
  }
  return url;
}

function fotoFromSheetCell(
  sheet: XLSX.WorkSheet,
  rowIndex: number,
  colIndex: number,
  fallback: unknown,
): string | undefined {
  if (colIndex >= 0) {
    const addr = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
    const cell = sheet[addr] as { l?: { Target?: string }; v?: unknown } | undefined;
    if (cell?.l?.Target) {
      const fromLink = normalizeFotoUrl(cell.l.Target);
      if (fromLink) return fromLink;
    }
  }
  return normalizeFotoUrl(fallback);
}

function isRowEmpty(row: Record<string, unknown>): boolean {
  return Object.values(row).every((v) => v == null || String(v).trim() === '');
}

export function parseProductosExcel(buffer: Buffer): FilaProductoExcel[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El archivo Excel no contiene hojas');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });

  if (rows.length === 0) {
    throw new Error('La hoja está vacía. Use la plantilla e incluya al menos una fila de producto.');
  }

  const headers = Object.keys(rows[0] ?? {});
  const headerMap = buildHeaderMap(headers);
  const fotoHeader = headerMap.get('foto');
  const fotoColIndex = fotoHeader ? headers.indexOf(fotoHeader) : -1;

  if (!headerMap.has('nombre')) {
    throw new Error(
      'No se encontró la columna "Nombre". Descargue la plantilla o incluya una columna llamada Nombre, Producto o Artículo.',
    );
  }

  const result: FilaProductoExcel[] = [];

  rows.forEach((row, index) => {
    if (isRowEmpty(row)) return;

    const fila = index + 2;
    const errores: string[] = [];
    const nombre = String(cellValue(row, 'nombre', headerMap) ?? '').trim();

    if (!nombre) {
      errores.push('Nombre obligatorio');
    }

    const cantidadRaw = parseNumber(cellValue(row, 'cantidad', headerMap), 0);
    if (Number.isNaN(cantidadRaw) || cantidadRaw < 0) {
      errores.push('Cantidad inválida');
    }

    const precioRaw = parseNumber(cellValue(row, 'precio', headerMap), 0);
    if (Number.isNaN(precioRaw) || precioRaw < 0) {
      errores.push('Precio inválido');
    }

    const categoriaRaw = cellValue(row, 'categoria', headerMap);
    const descripcionRaw = cellValue(row, 'descripcion', headerMap);
    const fotoRaw = cellValue(row, 'foto', headerMap);
    const unidadMedida = parseUnidad(cellValue(row, 'unidad', headerMap));

    const fotoUrl = fotoFromSheetCell(sheet, index, fotoColIndex, fotoRaw);
    if (fotoRaw && String(fotoRaw).trim() && !fotoUrl) {
      errores.push('URL de foto inválida — use http:// o https:// (o enlace en la celda de Excel)');
    }

    result.push({
      fila,
      nombre,
      categoria: categoriaRaw ? String(categoriaRaw).trim() : undefined,
      cantidadDisponible: Number.isNaN(cantidadRaw) ? 0 : Math.floor(cantidadRaw),
      precioReferencia: Number.isNaN(precioRaw) ? 0 : precioRaw,
      unidadMedida,
      descripcion: descripcionRaw ? String(descripcionRaw).trim() : undefined,
      fotoUrl,
      errores,
      valido: errores.length === 0 && nombre.length >= 2,
    });
  });

  if (result.length === 0) {
    throw new Error('No hay filas de productos para importar.');
  }

  return result;
}

export function buildPlantillaExcel(): Buffer {
  const headers = [
    'Nombre',
    'Categoría',
    'Cantidad',
    'Precio referencia',
    'Unidad',
    'Descripción',
    'URL foto',
  ];
  const ejemplo = [
    'Silla Tiffany blanca',
    'Sillas',
    500,
    45,
    'Pieza',
    'Silla apilable para eventos',
    'https://ejemplo.com/silla.jpg',
  ];

  const sheet = XLSX.utils.aoa_to_sheet([headers, ejemplo]);
  sheet['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 32 }, { wch: 36 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Inventario');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
