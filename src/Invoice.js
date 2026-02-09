// Invoice.gs
function generateInvoice() {
  const panel = getMainPanelSheet();
  const ss = getPanelSpreadsheet();

  const tenantsSheet = ss.getSheetByName("Inquilinos");
  const extrasSheet = ss.getSheetByName("Conceptos extra");

  if (!tenantsSheet || !extrasSheet) {
    SpreadsheetApp.getUi().alert(
      "Faltan hojas necesarias (Inquilinos o Conceptos extra)."
    );
    return;
  }

  const tenantSelection = panel.getRange("panel_inquilino").getValue();
  const month = panel.getRange("panel_mes").getValue();
  const year = panel.getRange("panel_ano").getValue();

  if (!tenantSelection || !month || !year) {
    SpreadsheetApp.getUi().alert("Selecciona inquilino, mes y año.");
    return;
  }

  const tenantId = Number(String(tenantSelection).split("-")[0].trim());
  const shortName = getTenantShortNameById(tenantId);

  // base
  const tenantData = tenantsSheet.getDataRange().getValues();
  const headers = tenantData[0];
  const idxId = headers.indexOf("ID");
  const idxBase = headers.indexOf("Base (€)");

  const tenantRow = tenantData.find(r => Number(r[idxId]) === tenantId);
  const baseAmount = Number(tenantRow[idxBase]) || 0;

  // extras
  const extrasData = extrasSheet.getDataRange().getValues().slice(1);
  let extrasWithVat = 0;
  let extrasWithoutVat = 0;

  extrasData.forEach(([m, y, tId, , amount, applyVat]) => {
    if (m === month && y === year && Number(tId) === tenantId) {
      const v = Number(amount) || 0;
      applyVat === "Sí" ? extrasWithVat += v : extrasWithoutVat += v;
    }
  });

  const vatRate = getDefaultVat();
  const taxableBase = baseAmount + extrasWithVat;
  const vatAmount = taxableBase * vatRate;
  const total = taxableBase + vatAmount;

  const invoiceName = `${shortName} ${year}-${monthToNumber(month)}`;
  const invoiceSpreadsheet = createInvoiceFromTemplate({
    invoiceName,
    tenantId
  });

  const url = invoiceSpreadsheet.getUrl();
  ss.getRangeByName("panel_last_invoice_url").setValue(url);

  showInvoiceSummaryDialog({
    shortName,
    month,
    year,
    total,
    url
  });
}
