/*************************************************
 * Main invoice orchestration
 *************************************************/

function createInvoice() {
  // 1️⃣ Read billing context from panel
  const context = readBillingContext();

  const year = context.invoiceDate.getFullYear();
  const month = context.invoiceDate.getMonth() + 1;

  // Domain rule: only one invoice per tenant and period
  if (invoiceExistsForPeriod(context.tenantId, context.year, context.month)) {
    throw new Error(`Invoice already exists for tenant ${context.tenantId} for ${context.year}-${context.month}. Aborting to prevent duplicates.`);
  }

  // 2️⃣ Calculate fiscal totals
  const calculated = calculateInvoiceTotals(context);

  const invoiceId = getNextInvoiceId(context.invoiceDate.getFullYear());

  // 3️⃣ Render spreadsheet
  const ss = generateInvoiceSpreadsheet(context, calculated, invoiceId);

  // 4️⃣ Build historical-compatible file name
  const fileName = buildFileName_(context);

  // 5️⃣ Move spreadsheet to tenant folder
  const tenantFolder = getTenantFolder(
    context.tenantId,
    context.tenantShortName
  );

  if (invoiceAlreadyExists(fileName, tenantFolder)) {
    throw new Error(`Invoice file "${fileName}" already exists in Drive folder "${tenantFolder.getName()}". Aborting to prevent duplicates.`);
  }

  // 6️⃣ Generate official invoice ID (N-YYYY, only if safe)
  const year = context.invoiceDate.getFullYear();
  const invoiceId = getNextInvoiceId(year);

  moveFileToFolder_(ss, fileName, tenantFolder);

  // 7️⃣ Generate PDF copy
  generatePdfCopy_(ss, fileName, tenantFolder);

  Logger.log(`Invoice ${invoiceId} generated successfully`);
}


/*************************************************
 * Spreadsheet rendering
 *************************************************/

function generateInvoiceSpreadsheet(context, calculated, invoiceId) {
  const ss = SpreadsheetApp.create('Invoice (temp)');
  const sheet = ss.getActiveSheet();

  setupInvoiceLayout(sheet);

  // Official invoice number
  sheet.getRangeByName('INVOICE_ID').setValue(invoiceId);

  // Tenant info
  sheet.getRangeByName('TENANT_NAME')
    .setValue(context.tenantFiscalName);

  sheet.getRangeByName('TENANT_ADDRESS')
    .setValue(context.tenantAddress || '');

  // Date and period
  sheet.getRangeByName('INVOICE_DATE')
    .setValue(context.invoiceDate);

  sheet.getRangeByName('PERIOD')
    .setValue(context.periodLabel);

  // Concept description (main concept block)
  if (context.concepts.length > 0) {
    sheet.getRangeByName('CONCEPT')
      .setValue(context.concepts[0].description || context.concepts[0].name);
  }

  // Render detailed concept lines + totals
  renderConceptLines(sheet, calculated);

  return ss;
}


/*************************************************
 * File naming
 *************************************************/

function buildFileName_(context) {
  const year = context.invoiceDate.getFullYear();
  const month = String(context.invoiceDate.getMonth() + 1).padStart(2, '0');

  // Historical compatibility:
  // "{tenant_short_name} {yyyy}-{mm}"
  return `${context.tenantShortName} ${year}-${month}`;
}


/*************************************************
 * Drive helpers
 *************************************************/

function invoiceAlreadyExists(fileName, folder) {
  const files = folder.getFilesByName(fileName);

  return files.hasNext();
}

function moveFileToFolder_(ss, fileName, folder) {
  const file = DriveApp.getFileById(ss.getId());

  file.setName(fileName);

  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}


function generatePdfCopy_(ss, fileName, folder) {
  const pdfBlob = ss.getBlob().getAs('application/pdf');

  folder.createFile(pdfBlob)
        .setName(`${fileName}.pdf`);
}
