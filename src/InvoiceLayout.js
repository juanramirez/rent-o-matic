/**
 * Renders the invoice layout exactly like the canonical Google Sheets invoice.
 * Uses formulas for amounts so the document remains manually editable.
 */

const FIRST_CONCEPT_ROW = 17; // Row where the first concept line is rendered (base amount row)
const VAT_ROW_OFFSET = 1; // Number of rows between base amount and VAT calculation
const WITHHOLDING_ROW_OFFSET = 2; // Number of rows between base amount and withholding calculation
const TOTAL_ROW_OFFSET = 4; // Number of rows between base amount and grand total

const VAT_ROW = FIRST_CONCEPT_ROW + VAT_ROW_OFFSET;
const WITHHOLDING_ROW = FIRST_CONCEPT_ROW + WITHHOLDING_ROW_OFFSET;
const TOTAL_ROW = FIRST_CONCEPT_ROW + TOTAL_ROW_OFFSET;

const BASE_COLUMN = 'G'; // Column where base amount is rendered (used as anchor for formulas)
const PERCENTAGE_COLUMN = 'C'; // Column where VAT and withholding percentages are rendered (used as anchor for formulas)

/**
 * Renders the canonical invoice layout in the given sheet.
 * Fiscal amounts are calculated via formulas,
 * so the document remains manually editable after generation.
 */
function setupInvoiceLayout(sheet) {
  sheet.setName('Factura');

  // Layout grid configuration (matches canonical spacing)
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

  // Issuer block (currently static, will become configurable)
  sheet.getRange('C4')
    .setValue('Pepito Pérez Jiménez - NIF 42494684H')
    .setHorizontalAlignment('left');

  // Invoice number label
  const numberRange = sheet.getRange('C7:D7');
  numberRange.merge();
  numberRange.setValue('Número:');
  numberRange.setHorizontalAlignment('left');

  // Invoice identifier (merged to support long numbering schemes)
  const invoiceIdRange = sheet.getRange('E7:F7');
  invoiceIdRange.merge();
  invoiceIdRange.setName('INVOICE_ID');
  invoiceIdRange.setFontWeight('bold');
  invoiceIdRange.setHorizontalAlignment('left');
  sheet.getRange('E7:F7')
    .merge()
    .setName('INVOICE_ID')
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  // Tenant
  sheet.getRange('H7:L7')
    .merge()
    .setName('TENANT_NAME')
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  // Invoice date
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

  // Tenant address
  sheet.getRange('H9')
    .setValue('Dirección:')
    .setHorizontalAlignment('left');

  sheet.getRange('I9:L9')
    .merge()
    .setName('TENANT_ADDRESS')
    .setFontWeight('bold')
    .setHorizontalAlignment('left');

  // Main concept section (multi-line, wrapped)
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

  // Billing period
  const periodRange = sheet.getRange('C15:G15');
  periodRange.merge();
  periodRange.setName('PERIOD');
  periodRange.setFontWeight('bold');
  periodRange.setHorizontalAlignment('center');

  // Taxable base (anchor row for fiscal formulas)
  sheet.getRange(`C${FIRST_CONCEPT_ROW}:F${FIRST_CONCEPT_ROW}`)
    .merge()
    .setValue(concept.name)
    .setHorizontalAlignment('left');

  sheet.getRange(`${BASE_COLUMN}${FIRST_CONCEPT_ROW}`)
    .setName('BASE_AMOUNT')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right');

  // VAT calculation (base x VAT_PERCENT)
  sheet.getRange(`${PERCENTAGE_COLUMN}${VAT_ROW}`)
    .setName('VAT_PERCENT')
    .setHorizontalAlignment('right');

  sheet.getRange(`${PERCENTAGE_COLUMN}${VAT_ROW}`)
    .setValue('IVA')
    .setHorizontalAlignment('left');

  sheet.getRange(`${BASE_COLUMN}${VAT_ROW}`)
    .setName('VAT_AMOUNT')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setFormula(`=G${FIRST_CONCEPT_ROW}*C${VAT_ROW}`);

  // Withholding (IRPF) calculation (negative value)
  sheet.getRange(`${PERCENTAGE_COLUMN}${WITHHOLDING_ROW}`)
    .setName('IRPF_PERCENT')
    .setHorizontalAlignment('right');

  sheet.getRange(`${PERCENTAGE_COLUMN}${WITHHOLDING_ROW}`)
    .setValue('Retención IRPF')
    .setHorizontalAlignment('left');

  sheet.getRange(`${BASE_COLUMN}${WITHHOLDING_ROW}`)
    .setName('IRPF_AMOUNT')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setFormula(`=-G${FIRST_CONCEPT_ROW}*C${WITHHOLDING_ROW}`);

  // Grand total (base + VAT - withholding)
  sheet.getRange(`${BASE_COLUMN}${TOTAL_ROW}:F${TOTAL_ROW}`)
    .merge()
    .setValue('TOTAL')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setBorder(true, false, false, false, false, false);

  sheet.getRange(`${BASE_COLUMN}${TOTAL_ROW}`)
    .setName('TOTAL_AMOUNT')
    .setFontWeight('bold')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setBorder(true, false, false, false, false, false)
    .setFormula(`=SUM(${BASE_COLUMN}${FIRST_CONCEPT_ROW}:${BASE_COLUMN}${WITHHOLDING_ROW})`);
}

/**
 * Injects invoice data and snapshots fiscal percentages.
 * This prevents historical invoices from changing if
 * configuration values (VAT, withholding) are updated after creation.
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

/*
 * Generates a PDF invoice with the given context and calculated fiscal values.
 */
function generateInvoicePdf(context, calculated, invoiceId) {
  const ss = SpreadsheetApp.create('Invoice (preview)');
  const sheet = ss.getActiveSheet();

  setupInvoiceLayout(sheet);

  const lines = calculated.lines;
  const totals = calculated.totals;

  let currentRow = FIRST_CONCEPT_ROW; // base amount row

  // Write invoice id to the sheet so it can be included in the PDF filename when exporting.
  sheet.getRangeByName('INVOICE_ID').setValue(invoiceId);
  
  // Render concept lines sequentially starting from base row.
  lines.forEach(line => {
    sheet.getRange(`C${currentRow}:F${currentRow}`)
      .setValue(line.description || line.name);

    sheet.getRange(`G${currentRow}`)
      .setValue(line.base);

    currentRow++;
  });

  // Render aggregated totals below concept lines.
  sheet.getRange(`F${currentRow + 1}`).setValue("Base total");
  sheet.getRange(`G${currentRow + 1}`).setValue(totals.base);

  sheet.getRange(`F${currentRow + 2}`).setValue("IVA");
  sheet.getRange(`G${currentRow + 2}`).setValue(totals.vat);

  sheet.getRange(`F${currentRow + 3}`).setValue("Retención");
  sheet.getRange(`G${currentRow + 3}`).setValue(totals.withholding);

  sheet.getRange(`F${currentRow + 4}`).setValue("TOTAL");
  sheet.getRange(`G${currentRow + 4}`).setValue(totals.grandTotal);

  protectSheet(sheet);
}

function protectSheet(sheet) {
  const protection = sheet.protect().setDescription('Invoiced locked after generation');
  
  // Only the owner can edit the invoice after generation, to prevent accidental changes to fiscal formulas.
  const me = sessionStorage.getEffectiveUser();
  protection.addEditor(me);
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}