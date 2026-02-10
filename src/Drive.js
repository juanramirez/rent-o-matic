import { CONFIG } from './Config';

/**
 * Returns the Drive folder for a tenant.
 * Creates it if it does not exist.
 *
 * Folder name format: "001 ACME Corp"
 */
export function getTenantFolder(tenantId, shortName) {
  const root = DriveApp.getFolderById(CONFIG.INVOICES_FOLDER_ID);

  const prefix = String(tenantId).padStart(3, '0');
  const folderName = `${prefix} ${shortName}`;

  const folders = root.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  // Folder does not exist → create it
  return root.createFolder(folderName);
}

/**
 * Creates a new invoice spreadsheet from the template
 * inside the tenant folder.
 */
export function createInvoiceFromTemplate({ invoiceName, tenantId, shortName }) {
  const template = DriveApp.getFileById(CONFIG.INVOICE_TEMPLATE_ID);
  const tenantFolder = getTenantFolder(tenantId, shortName);

  const file = template.makeCopy(invoiceName, tenantFolder);
  return SpreadsheetApp.openById(file.getId());
}

