/*************************************************
 * Helpers puros (sin acceso a Sheets)
 *************************************************/

function buildInvoiceDate_(month, year) {
  return new Date(year, month - 1, 1);
}

function buildPeriodLabel_(month, year) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return months[month - 1] + ' de ' + year;
}

function normalizeMonth_(value) {
  if (typeof value === 'number') {
    return value;
  }

  const months = {
    'enero': 1,
    'febrero': 2,
    'marzo': 3,
    'abril': 4,
    'mayo': 5,
    'junio': 6,
    'julio': 7,
    'agosto': 8,
    'septiembre': 9,
    'octubre': 10,
    'noviembre': 11,
    'diciembre': 12
  };

  const normalized = String(value).toLowerCase().trim();
  return months[normalized];
}

function extractTenantId_(value) {
  const str = String(value);
  const match = str.match(/^(\d+)\s*-/);

  if (!match) {
    throw new Error('Formato de inquilino inválido: ' + value);
  }

  return Number(match[1]);
}


/*************************************************
 * Lectura de Panel
 *************************************************/

function readPanelSelection_() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Panel');

  if (!sheet) {
    throw new Error('No existe la hoja "Panel"');
  }

  const tenantRaw = sheet.getRange('E7').getValue();
  const monthValue = sheet.getRange('E8').getValue();
  const yearValue = sheet.getRange('E9').getValue();

  if (!tenantRaw) throw new Error('Inquilino no seleccionado');
  if (!monthValue) throw new Error('Mes no seleccionado');
  if (!yearValue) throw new Error('Año no seleccionado');

  const tenantId = extractTenantId_(tenantRaw);
  const month = normalizeMonth_(monthValue);
  const year = Number(yearValue);

  if (!month || month < 1 || month > 12) {
    throw new Error('Mes inválido: ' + monthValue);
  }

  if (!year || year < 2000) {
    throw new Error('Año inválido: ' + yearValue);
  }

  return {
    tenantId,
    month,
    year
  };
}


/*************************************************
 * Función principal (aún incompleta)
 *************************************************/

function readBillingContext() {
  const selection = readPanelSelection_();

  return {
    tenantId: selection.tenantId,
    tenantShortName: null,
    tenantFiscalName: null,
    tenantTaxId: null,
    tenantAddress: null,

    invoiceDate: buildInvoiceDate_(selection.month, selection.year),
    periodLabel: buildPeriodLabel_(selection.month, selection.year),

    concepts: [],

    vatPercent: null,
    irpfPercent: null
  };
}
