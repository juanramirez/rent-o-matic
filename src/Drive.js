import { CONFIG } from './Config';

function getTenantFolder(tenantId) {
  const root = DriveApp.getFolderById(CONFIG.INVOICES_FOLDER_ID);
  const prefix = String(tenantId).padStart(3, "0") + " ";

  const folders = root.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.getName().startsWith(prefix)) {
      return folder;
    }
  }

  throw new Error(`Carpeta no encontrada para ${prefix}`);
}

function createInvoiceFromTemplate({ invoiceName, tenantId }) {
  const template = DriveApp.getFileById(INVOICE_TEMPLATE_ID);
  const folder = getTenantFolder(tenantId);

  const file = template.makeCopy(invoiceName, folder);
  return SpreadsheetApp.openById(file.getId());
}
