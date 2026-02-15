/**
 * Renders the canonical invoice layout in the given sheet.
 * All named ranges are registered at spreadsheet level.
 */
function setupInvoiceLayout(sheet) {
  const ss = sheet.getParent();

  sheet.setName('Factura');

  // ─────────────────────────────────────────────
  // Layout grid configuration
  // ─────────────────────────────────────────────

  sheet.setColumnWidths(1, 1, 30);
  sheet.setColumnWidths(2, 1, 30);
  sheet.setColumnWidths(3, 1, 120);
  sheet.setColumnWidths(4, 1, 80);
  sheet.setColumnWidths(5, 1, 80);
  sheet.setColumnWidths(6, 1, 80);
  sheet.setColumnWidths(7, 1, 120);
  sheet.setColumnWidths(8, 1, 120);
  sheet.setColumnWidths(9, 1, 120);
  sheet.setColumnWidths(10, 1, 80);
  sheet.setColumnWidths(11, 1, 80);
  sheet.setColumnWidths(12, 1, 80);

  // ─────────────────────────────────────────────
  // Issuer
  // ─────────────────────────────────────────────

  sheet.getRange('C4')
    .setValue('Pepito Pérez Jiménez - NIF 42494684H')
    .setHorizontalAlignment('left');

  // ─────────────────────────────────────────────
  // Invoice number label
  // ─────────────────────────────────────────────

  sheet.getRange('C7:D7')
    .merge()
    .setValue('Número:')
    .setHorizontalAlignment('left');

  // Invoice ID
  const invoiceIdRange = sheet.getRange('E7:F7');
  invoiceIdRange.merge();
  invoiceIdRange.setFontWeight('bold');
  invoiceIdRange.setHorizontalAlignment('left');
  ss.setNamedRange('INVOICE_ID', invoiceIdRange);

  // ─────────────────────────────────────────────
  // Tenant
  // ─────────────────────────────────────────────

  const tenantNameRange = sheet.getRange('H7:L7');
  tenantNameRange.merge();
  tenantNameRange.setFontWeight('bold');
  tenantNameRange.setHorizontalAlignment('left');
  ss.setNamedRange('TENANT_NAME', tenantNameRange);

  // ─────────────────────────────────────────────
  // Invoice date
  // ─────────────────────────────────────────────

  sheet.getRange('C9:D9')
    .merge()
    .setValue('Fecha:')
    .setHorizontalAlignment('left');

  const invoiceDateRange = sheet.getRange('E9:F9');
  invoiceDateRange.merge();
  invoiceDateRange.setFontWeight('bold');
  invoiceDateRange.setNumberFormat('dd/MM/yyyy');
  invoiceDateRange.setHorizontalAlignment('left');
  ss.setNamedRange('INVOICE_DATE', invoiceDateRange);

  // ─────────────────────────────────────────────
  // Tenant address
  // ─────────────────────────────────────────────

  sheet.getRange('H9')
    .setValue('Dirección:')
    .setHorizontalAlignment('left');

  const tenantAddressRange = sheet.getRange('I9:L9');
  tenantAddressRange.merge();
  tenantAddressRange.setFontWeight('bold');
  tenantAddressRange.setHorizontalAlignment('left');
  ss.setNamedRange('TENANT_ADDRESS', tenantAddressRange);

  // ─────────────────────────────────────────────
  // Concept block
  // ─────────────────────────────────────────────

  sheet.getRange('C11:D12')
    .merge()
    .setValue('Concepto:')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('top');

  const conceptRange = sheet.getRange('E11:L12');
  conceptRange.merge();
  conceptRange.setFontWeight('bold');
  conceptRange.setWrap(true);
  conceptRange.setVerticalAlignment('top');
  conceptRange.setHorizontalAlignment('left');
  ss.setNamedRange('CONCEPT', conceptRange);

  // ─────────────────────────────────────────────
  // Period
  // ─────────────────────────────────────────────

  const periodRange = sheet.getRange('C15:G15');
  periodRange.merge();
  periodRange.setFontWeight('bold');
  periodRange.setHorizontalAlignment('center');
  ss.setNamedRange('PERIOD', periodRange);

  // ─────────────────────────────────────────────
  // Base amount (anchor)
  // ─────────────────────────────────────────────

  sheet.getRange('C17:F17')
    .merge()
    .setHorizontalAlignment('left');

  const baseAmountRange = sheet.getRange('G17');
  baseAmountRange
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right');
  ss.setNamedRange('BASE_AMOUNT', baseAmountRange);

  // ─────────────────────────────────────────────
  // VAT
  // ─────────────────────────────────────────────

  const vatPercentRange = sheet.getRange('C18');
  vatPercentRange.setHorizontalAlignment('right');
  ss.setNamedRange('VAT_PERCENT', vatPercentRange);

  sheet.getRange('D18')
    .setValue('IVA')
    .setHorizontalAlignment('left');

  const vatAmountRange = sheet.getRange('G18');
  vatAmountRange
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setFormula('=G17*C18');
  ss.setNamedRange('VAT_AMOUNT', vatAmountRange);

  // ─────────────────────────────────────────────
  // Withholding
  // ─────────────────────────────────────────────

  const withholdingPercentRange = sheet.getRange('C19');
  withholdingPercentRange.setHorizontalAlignment('right');
  ss.setNamedRange('IRPF_PERCENT', withholdingPercentRange);

  sheet.getRange('D19')
    .setValue('Retención IRPF')
    .setHorizontalAlignment('left');

  const withholdingAmountRange = sheet.getRange('G19');
  withholdingAmountRange
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setFormula('=-G17*C19');
  ss.setNamedRange('IRPF_AMOUNT', withholdingAmountRange);

  // ─────────────────────────────────────────────
  // Total
  // ─────────────────────────────────────────────

  sheet.getRange('C21:F21')
    .merge()
    .setValue('TOTAL')
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setBorder(true, false, false, false, false, false);

  const totalRange = sheet.getRange('G21');
  totalRange
    .setFontWeight('bold')
    .setNumberFormat('#,##0.00 €')
    .setHorizontalAlignment('right')
    .setBorder(true, false, false, false, false, false)
    .setFormula('=SUM(G17:G19)');
  ss.setNamedRange('TOTAL_AMOUNT', totalRange);
}
