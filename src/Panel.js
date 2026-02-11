/**
 * Contract between the billing panel UI (Google Sheets)
 * and the application logic.
 */
const PANEL_SCHEMA = {
  tenant: 'B4',
  period: 'B5',
  invoiceDate: 'B6',
  baseAmount: 'B8',
  vatPercent: 'B9'
};

function readBillingPanel() {
  const sheet = SpreadsheetApp
    .getActive()
    .getSheetByName('Panel');

  if (!sheet) {
    throw new Error('No existe la hoja "Panel".');
  }

  const rawData = {};

  for (const [key, cell] of Object.entries(PANEL_SCHEMA)) {
    const value = sheet.getRange(cell).getValue();

    if (value === '' || value === null) {
      throw new Error(
        `El campo "${key}" está vacío (celda ${cell}).`
      );
    }

    rawData[key] = value;
  }

  return normalizePanelData(rawData);
}

function normalizePanelData(raw) {
  const baseAmount = Number(raw.baseAmount);
  const vatPercent = Number(raw.vatPercent);
  const invoiceDate = new Date(raw.invoiceDate);

  if (Number.isNaN(baseAmount) || baseAmount <= 0) {
    throw new Error('La base imponible debe ser un número mayor que 0.');
  }

  if (Number.isNaN(vatPercent) || vatPercent < 0) {
    throw new Error('El IVA debe ser un número igual o mayor que 0.');
  }

  if (isNaN(invoiceDate.getTime())) {
    throw new Error('La fecha de factura no es válida.');
  }

  return {
    tenant: String(raw.tenant).trim(),
    period: String(raw.period).trim(),
    invoiceDate,
    baseAmount,
    vatPercent,
    vatAmount: roundCurrency(baseAmount * vatPercent / 100),
    totalAmount: roundCurrency(
      baseAmount * (1 + vatPercent / 100)
    )
  };
}

function debugPanel() {
  
}