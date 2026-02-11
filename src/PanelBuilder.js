/**
 * PanelBuilder
 * Creates the billing panel structure programmatically.
 * Safe to run multiple times (it recreates sheets).
 */

function buildPanel(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);

  createDashboardSheet(ss);
  createInvoicesSheet(ss);
  createTenantsSheet(ss);
}

/**
 * Helpers
 */

function recreateSheet_(ss, name) {
  const existing = ss.getSheetByName(name);
  if (existing) {
    ss.deleteSheet(existing);
  }
  return ss.insertSheet(name);
}

/**
 * Sheets
 */

function createDashboardSheet(ss) {
  const sheet = recreateSheet_(ss, 'Dashboard');

  sheet.getRange('A1').setValue('Billing Panel');
  sheet.getRange('A2').setValue('(auto-generated — do not edit)');

  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  sheet.getRange('A2').setFontStyle('italic');
}

function createInvoicesSheet(ss) {
  const sheet = recreateSheet_(ss, 'Invoices');

  const headers = [
    'Invoice ID',
    'Tenant',
    'Date',
    'Concept',
    'Net Amount',
    'VAT',
    'Total',
    'Drive File ID',
    'Created At',
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function createTenantsSheet(ss) {
  const sheet = recreateSheet_(ss, 'Tenants');

  const headers = [
    'Tenant ID',
    'Short Name',
    'Legal Name',
    'VAT Number',
    'Address',
    'Email',
    'Active',
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}
