export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calcTotalesCotizacion(
  items: Array<{ cantidad: number; precioUnitario: number }>,
  costoEnvio: number,
  descuentoPorcentaje: number,
  ivaPorcentaje: number,
  ivaIncluido: boolean,
) {
  const subtotalProductos = roundMoney(
    items.reduce((acc, i) => acc + roundMoney(i.cantidad * i.precioUnitario), 0),
  );
  const subtotal = roundMoney(subtotalProductos + costoEnvio);
  const descuentoMonto = roundMoney(subtotal * (descuentoPorcentaje / 100));
  const base = roundMoney(subtotal - descuentoMonto);

  if (ivaIncluido) {
    const montoIva = roundMoney(base - base / (1 + ivaPorcentaje / 100));
    return { subtotal: subtotalProductos, descuentoMonto, montoIva, total: base };
  }

  const montoIva = roundMoney(base * (ivaPorcentaje / 100));
  return {
    subtotal: subtotalProductos,
    descuentoMonto,
    montoIva,
    total: roundMoney(base + montoIva),
  };
}

export function abrirPdfHtml(html: string, titulo: string) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Permite ventanas emergentes para ver el PDF');
    return;
  }
  win.document.write(html);
  win.document.title = titulo;
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export function rangoFechaConsulta(fecha: string) {
  const day = fecha.slice(0, 10);
  return {
    fechaInicio: `${day}T00:00:00.000Z`,
    fechaFin: `${day}T23:59:59.999Z`,
  };
}
