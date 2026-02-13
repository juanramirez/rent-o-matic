function createInvoiceFromPanel() {
  const data = readBillingPanel();
  const year = getInvoiceYear(data.invoiceDate);
  const invoiceId = getNextInvoiceId(year);
  
  const spreadsheet = SpreadsheetApp.create('Invoice (preview)');
  const sheet = spreadsheet.getActiveSheet();

  setupInvoiceLayout(sheet);
  fillInvoiceData(sheet, data, invoiceId);

  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  /*
  const invoice = generateInvoiceSpreadsheet(data);
  SpreadsheetApp.setActiveSpreadsheet('Invoice (preview)');
  */
}

function createInvoice() {
  const context = readBillingContext();
  const calculated = calculateInvoiceTotals(context);

  generateInvoicePdf(context, calculated);
}

function generateInvoiceSpreadsheet(data) {
  const ss = SpreadsheetApp.create('Invoice (preview)');
  const sheet = ss.getActiveSheet();

  setupInvoiceLayout(sheet);
  fillInvoiceData(sheet, data);

  return ss;
}