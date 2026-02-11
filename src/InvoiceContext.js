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

function readTenantById_(tenantId) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Inquilinos');

  if (!sheet) {
    throw new Error('No existe la hoja "Inquilinos"');
  }

  const values = sheet.getDataRange().getValues();
  const header = values[0];

  const COL = {
    ID: 0,
    SHORT_NAME: 1,
    FISCAL_NAME: 3,
    TAX_ID: 4,
    ADDRESS: 5,
    BASE_CONCEPT: 6,
    INVOICE_CONCEPT: 7,
    BASE_AMOUNT: 9
  };

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (Number(row[COL.ID]) === tenantId) {
      return {
        id: tenantId,
        shortName: row[COL.SHORT_NAME],
        fiscalName: row[COL.FISCAL_NAME],
        taxId: row[COL.TAX_ID],
        address: row[COL.ADDRESS],
        invoiceConcept: row[COL.INVOICE_CONCEPT],
        baseConcept: row[COL.BASE_CONCEPT],
        baseAmount: Number(row[COL.BASE_AMOUNT])
      };
    }
  }

  throw new Error('Inquilino no encontrado: ' + tenantId);
}

function readExtraConcepts_(tenantId, month, year) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Conceptos extra');

  if (!sheet) {
    return [];
  }

  const values = sheet.getDataRange().getValues();

  const COL = {
    MES: 0,
    ANO: 1,
    INQUILINO: 2,
    CONCEPTO: 3,
    IMPORTE: 4,
    APLICA_IVA: 5
  };

  const results = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];

    if (!row[COL.MES] || !row[COL.ANO] || !row[COL.INQUILINO]) {
      continue;
    }

    const rowMonth = normalizeMonth_(row[COL.MES]);
    const rowYear = Number(row[COL.ANO]);
    const rowTenantId = extractTenantId_(row[COL.INQUILINO]);

    if (
      rowTenantId === tenantId &&
      rowMonth === month &&
      rowYear === year
    ) {
      results.push({
        name: row[COL.CONCEPTO],
        amount: Number(row[COL.IMPORTE]),
        appliesVat: Boolean(row[COL.APLICA_IVA])
      });
    }
  }

  return results;
}



/*********************
 * Función principal
 *********************/

const COL_CONCEPTO_BASE = 6;
const COL_CONCEPTO_FACTURA = 7;
const COL_BASE = 9;

function readBillingContext() {
  const selection = readPanelSelection_();
  const tenant = readTenantById_(selection.tenantId);

  const baseConceptLabel = tenant.invoiceConcept;
  const baseConceptDescription = tenant.baseConcept;
  const baseAmount = parseEuroNumber_(tenant.baseAmount);

  const baseConcept = {
    name: tenant.invoiceConcept,
    description: tenant.baseConcept,
    amount: parseEuroNumber_(tenant.baseAmount),
    appliesVat: true
  };

  concepts = [({
    /* base concept is always first */
    name: tenant.invoiceConcept,
    description: tenant.baseConcept,
    amount: parseEuroNumber_(tenant.baseAmount),
    appliesVat: true,
    vatRate: null,
    appliesWithholding: false,
    withholdingRate: null
  })];

  const extraConcepts = readExtraConcepts_(
    tenant.id,
    selection.month,
    selection.year
  );
  concepts.push(...extraConcepts);

  return {
    tenantId: tenant.id,
    tenantShortName: tenant.shortName,
    tenantFiscalName: tenant.fiscalName,
    tenantTaxId: tenant.taxId,
    tenantAddress: tenant.address,

    invoiceDate: buildInvoiceDate_(selection.month, selection.year),
    periodLabel: buildPeriodLabel_(selection.month, selection.year),

    concepts,

    vatPercent: null,
    irpfPercent: null
  };
}

function debugBillingContext() {
    Logger.log(readBillingContext());
}

