function monthToNumber(month) {
  const map = {
    Enero: "01", Febrero: "02", Marzo: "03", Abril: "04",
    Mayo: "05", Junio: "06", Julio: "07", Agosto: "08",
    Septiembre: "09", Octubre: "10", Noviembre: "11", Diciembre: "12"
  };
  return map[month];
}

function parseEuroNumber_(value) {
  if (typeof value === 'number') {
    return value;
  }

  return Number(
    String(value)
      .replace(/\./g, '')     // quitar separador de miles
      .replace(',', '.')      // convertir decimal europeo
      .replace(/[^\d.]/g, '') // quitar €
  );
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}