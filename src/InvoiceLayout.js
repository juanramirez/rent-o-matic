/**
 * Renders the invoice layout exactly like the canonical Google Sheets invoice.
 * Uses formulas for amounts so the document remains manually editable.
 */

/**
 * Creates the full layout (structure + styles).
 */
function setupInvoiceLayout(sheet) {
  sheet.setName('Factura');

  // --- Column widths (match the original spacing) ---
  sheet.setColumnWidths(1, 1, 30);   // A (left margin)
  sheet.setColumnWidths(2, 1, 30);   // B
  sheet.setColumnWidths(3, 1, 120);  // C
  sheet.setColumnWidths(4, 1, 80);   // D
  sheet.setColumnWidths(5, 1, 80);   // E
  sheet.setColumnWidths(6, 1, 80);   // F
  sheet.setColumnWidths(7, 1, 120);  // G (amounts)
  sheet.setColumnWidths(8, 1, 120);  // H
  sheet.setColumnWidths(9, 1, 120);  // I
  sheet.setColumnWidths(10, 1, 80);  // J
  sheet.setColumnWidths(11, 1, 80);  // K
  sheet.setColumnWidths(12, 1, 80);  // L

  // --- Emisor (fixed text / config-driven later) ---
  sheet.getRange('C4')
    .setValue('Pepito Pérez Jiménez - NIF 42494684H')
    .setHorizontalAlignment('left');

  // --- Número ---
  sheet.getRange('C7:D7')
    .merge()
    .setValue('Número:')
    .setHorizontalAlignment('left');

  sheet.getRange('E7:F7')
    .merge()
    .setName('INVOICE_ID')
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  // --- Inquilino ---
  sheet.getRange('H7:L7')
    .merge()
    .setName('TENANT_NAME')
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  // --- Fecha ---
  sheet.getRange('C9:D9')
    .merge()
    .setValue('Fecha:')
    .setHorizontalAlignment('left');

  sheet.getRange('E9:F9')
    .merge()
    .setName('INVOICE_DATE')
    .setFontWeight('bold')
    .setNumberFormat('dd/MM/yyyy')
    .setHorizontalAlignment('left');

  // --- Dirección ---
  sheet.getRange('H9')
    .setValue('Dirección:')
    .setHorizontalAlignment('left');

  sheet.getRange('I9:L9')
    .merge()
    .setName('TENANT_ADDRESS')
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  // --- Concepto ---
  sheet.getRange('C11:D12')
    .merge()
    .setValue('Concepto:')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('top');

  sheet.getRange('E11:L12')
    .merge()
    .setName('CONCEPT')
    .setFontWeight('bold')
    .setWrap(true)
    .setVerticalAlignment('top')
    .setHorizontalAlignment('left')
    .setValue(concept.name);

  // --- Periodo ---
  sheet.getRange('C15:G15')
    .merge()
    .setName('PERIOD')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // --- Base imponible ---
  sheet.getRange('C17:F17')
    .merge()
    .setValue(concept.name)
    .setHorizontalAlignment('left');

  sheet.getRange('G17')
    .setName('BASE_AMOUNT')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right');

  // --- IVA ---
  sheet.getRange('C18')
    .setName('VAT_PERCENT')
    .setHorizontalAlignment('right');

  sheet.getRange('D18')
    .setValue('IVA')
    .setHorizontalAlignment('left');

  sheet.getRange('G18')
    .setName('VAT_AMOUNT')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setFormula('=G17*C18');

  // --- IRPF ---
  sheet.getRange('C19')
    .setName('IRPF_PERCENT')
    .setHorizontalAlignment('right');

  sheet.getRange('D19')
    .setValue('Retención IRPF')
    .setHorizontalAlignment('left');

  sheet.getRange('G19')
    .setName('IRPF_AMOUNT')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setFormula('=-G17*C19');

  // --- TOTAL ---
  sheet.getRange('C21:F21')
    .merge()
    .setValue('TOTAL')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setBorder(true, false, false, false, false, false);

  sheet.getRange('G21')
    .setName('TOTAL_AMOUNT')
    .setFontWeight('bold')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setBorder(true, false, false, false, false, false)
    .setFormula('=SUM(G17:G19)');
}

/**
 * Fills the invoice with data and snapshots fiscal values.
 */
function fillInvoiceData(sheet, data, invoiceId) {
  sheet.getRangeByName('INVOICE_ID').setValue(invoiceId);
  sheet.getRangeByName('TENANT_NAME').setValue(data.tenant);
  sheet.getRangeByName('TENANT_ADDRESS').setValue(data.address || '');
  sheet.getRangeByName('INVOICE_DATE').setValue(data.invoiceDate);
  sheet.getRangeByName('PERIOD').setValue(data.period);
  sheet.getRangeByName('CONCEPT').setValue(data.concept);

  sheet.getRangeByName('BASE_AMOUNT').setValue(data.baseAmount);

  // Snapshot fiscal values (copied from panel at creation time)
  sheet.getRangeByName('VAT_PERCENT').setValue(data.vatPercent);
  sheet.getRangeByName('IRPF_PERCENT').setValue(data.irpfPercent);
}

function generateInvoicePdf(context, calculated) {
  const lines = calculated.lines;
  const totals = calculated.totals;

  // pintar líneas
  // pintar totales
}
