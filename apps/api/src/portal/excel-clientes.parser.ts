import * as XLSX from 'xlsx';

export interface FilaClienteExcel {
  fila: number;
  nombre: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  notas?: string;
  errores: string[];
  valido: boolean;
}

const COLUMN_ALIASES: Record<string, string[]> = {
  nombre: ['nombre', 'cliente', 'contacto', 'nombre cliente', 'nombre completo'],
  empresa: ['empresa', 'compania', 'compañía', 'organizacion', 'organización', 'razon social', 'razón social'],
  email: ['email', 'correo', 'e-mail', 'mail', 'correo electronico', 'correo electrónico'],
  telefono: ['telefono', 'teléfono', 'tel', 'celular', 'movil', 'móvil', 'whatsapp'],
  notas: ['notas', 'nota', 'comentarios', 'comentario', 'observaciones'],
};

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

function cellValue(
  row: Record<string, unknown>,
  field: keyof typeof COLUMN_ALIASES,
  headerMap: Map<string, string>,
): unknown {
  const header = headerMap.get(field);
  if (!header) return undefined;
  return row[header];
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

function isRowEmpty(row: Record<string, unknown>): boolean {
  return Object.values(row).every((v) => v == null || String(v).trim() === '');
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseClientesExcel(buffer: Buffer): FilaClienteExcel[] {
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
    throw new Error('La hoja está vacía. Use la plantilla e incluya al menos una fila de cliente.');
  }

  const headers = Object.keys(rows[0] ?? {});
  const headerMap = buildHeaderMap(headers);

  if (!headerMap.has('nombre')) {
    throw new Error(
      'No se encontró la columna "Nombre". Descargue la plantilla o incluya una columna llamada Nombre o Cliente.',
    );
  }

  const result: FilaClienteExcel[] = [];

  rows.forEach((row, index) => {
    if (isRowEmpty(row)) return;

    const fila = index + 2;
    const errores: string[] = [];
    const nombre = String(cellValue(row, 'nombre', headerMap) ?? '').trim();
    const empresa = String(cellValue(row, 'empresa', headerMap) ?? '').trim();
    const email = String(cellValue(row, 'email', headerMap) ?? '').trim();
    const telefono = String(cellValue(row, 'telefono', headerMap) ?? '').trim();
    const notas = String(cellValue(row, 'notas', headerMap) ?? '').trim();

    if (nombre.length < 2) {
      errores.push('El nombre es obligatorio (mínimo 2 caracteres)');
    }
    if (email && !isValidEmail(email)) {
      errores.push('Correo electrónico inválido');
    }

    result.push({
      fila,
      nombre,
      empresa: empresa || undefined,
      email: email || undefined,
      telefono: telefono || undefined,
      notas: notas || undefined,
      errores,
      valido: errores.length === 0,
    });
  });

  if (result.length === 0) {
    throw new Error('No hay filas de clientes para importar.');
  }

  return result;
}

export function buildPlantillaClientesExcel(): Buffer {
  const headers = ['Nombre', 'Empresa', 'Correo', 'Teléfono', 'Notas'];
  const ejemplo = [
    'María González',
    'Eventos MG',
    'maria@eventosmg.com',
    '5512345678',
    'Cliente frecuente — bodas corporativas',
  ];

  const sheet = XLSX.utils.aoa_to_sheet([headers, ejemplo]);
  sheet['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 36 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Clientes');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
