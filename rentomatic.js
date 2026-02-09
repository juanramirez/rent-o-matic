/*************************************************
 * CONFIGURATION
 *************************************************/

const PANEL_SPREADSHEET_ID = "1q_wM9qFlpCUaWPamX_kdSlTSUKyjIiPyLuQDSQG_dno";
const INVOICE_TEMPLATE_ID = "1jY6ktYaWZ_dvyBR9QSnCZUsnwDskr0wFzgQWpAkF2ms";
const INVOICES_FOLDER_ID = "0Bz6ISLBS_kPqRWpFa2NaWnBoNHc";

const MAIN_PANEL_SHEET_NAME = "Panel principal";
const CONFIG_SHEET_NAME = "Configuración";

/*************************************************
 * SPREADSHEET AND SHEET ACCESS
 *************************************************/

function getPanelSpreadsheet() {
  return SpreadsheetApp.openById(PANEL_SPREADSHEET_ID);
}

function getMainPanelSheet() {
  const sheet = getPanelSpreadsheet().getSheetByName(MAIN_PANEL_SHEET_NAME);
  if (!sheet) {
    throw new Error(`No se encuentra la hoja ${MAIN_PANEL_SHEET_NAME}`);
  }
  return sheet;
}

function getConfigValue(configKey, label) {
  const range = getPanelSpreadsheet().getRangeByName(configKey);
  if (!range) {
    throw new Error(`${label} no definido (rango ${configKey})`);
  }
  return range.getValue();
}

/*************************************************
 * TENANT LOGIC
 *************************************************/

function getTenantShortNameById(tenantId) {
  const sheet = getPanelSpreadsheet().getSheetByName("Inquilinos");
  if (!sheet) throw new Error("No se encuentra la hoja Inquilinos");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idxId = headers.indexOf("ID");
  const idxShortName = headers.indexOf("Nombre corto");

  if (idxId === -1 || idxShortName === -1) {
    throw new Error('La hoja Inquilinos debe tener columnas "ID" y "Nombre corto"');
  }

  const row = data.find((r, i) => i > 0 && Number(r[idxId]) === Number(tenantId));
  if (!row) {
    throw new Error(`No se ha encontrado el inquilino con ID ${tenantId}`);
  }

  return row[idxShortName];
}

/*************************************************
 * VAT/Withholding configuration
 *************************************************/
 
function getDefaultVat() {
  const vat = getConfigValue("DEFAULT_VAT", "IVA por defecto");
  if (typeof vat !== "number" || vat <= 0 || vat >= 1) {
    throw new Error("DEFAULT_VAT debe ser un decimal entre 0 y 1");
  }
  return vat;
}

function getDefaultWithholding() {
  const value = getConfigValue("DEFAULT_TAX_WITHHOLDING", "Retención por defecto");
  if (typeof value !== "number" || value <= 0 || value >= 1) {
    throw new Error("DEFAULT_TAX_WITHHOLDING debe ser un decimal tipo 0.19");
  }
  return value;
}

/*************************************************
 * Drive: localize tenant folder
 *************************************************/

function getTenantFolder(tenantId) {
  const root = DriveApp.getFolderById(INVOICES_FOLDER_ID);
  const prefix = String(tenantId).padStart(3, "0") + " ";

  const folders = root.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    if (folder.getName().startsWith(prefix)) {
      return folder;
    }
  }

  throw new Error(`No se encuentra la carpeta del inquilino ${prefix}`);
}

/*************************************************
 * Invoice creation
 *************************************************/

function createInvoiceFromTemplate({ invoiceName, tenantId }) {
  const templateFile = DriveApp.getFileById(INVOICE_TEMPLATE_ID);
  const tenantFolder = getTenantFolder(tenantId);

  const newFile = templateFile.makeCopy(invoiceName, tenantFolder);
  return SpreadsheetApp.openById(newFile.getId());
}

/*************************************************
 * Formatting utilities
 *************************************************/

function monthToNumber(month) {
  const map = {
    Enero: "01", Febrero: "02", Marzo: "03", Abril: "04",
    Mayo: "05", Junio: "06", Julio: "07", Agosto: "08",
    Septiembre: "09", Octubre: "10", Noviembre: "11", Diciembre: "12"
  };
  return map[month];
}


/*************************************************
 * MAIN
 *************************************************/

/**
 * Creates a new invoice file by duplicating the template.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function createInvoiceFromTemplate(newName) {
  const templateFile = DriveApp.getFileById(INVOICE_TEMPLATE_ID);
  const targetFolder = DriveApp.getFolderById(INVOICES_FOLDER_ID);

  const newFile = templateFile.makeCopy(newName, targetFolder);
  return SpreadsheetApp.openById(newFile.getId());
}

function showInvoiceLink(url) {
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: Arial; font-size: 14px;">
      <p>Factura creada correctamente ✅</p>
      <p>
        Ábrela
        <a href="${url}" target="_blank">aquí</a>
      </p>
    </div>
  `).setWidth(300).setHeight(150);

  SpreadsheetApp.getUi().showModalDialog(
    html,
    "Factura creada"
  );
}

/**
 * Main entry point: reads panel selection, calculates totals,
 * and shows a human-readable summary.
 */
function generateInvoice() {
  const panel = getMainPanelSheet();
  const tenantsSheet = getPanelSpreadsheet().getSheetByName("Inquilinos");
  const extrasSheet = getPanelSpreadsheet().getSheetByName("Conceptos extra");

  // Ensure required sheets exist
  if (!panel || !tenantsSheet || !extrasSheet) {
    SpreadsheetApp.getUi().alert(
      "Faltan hojas necesarias (Panel principal, Inquilinos o Conceptos extra)."
    );
    return;
  }

  // --- Read panel values ---
  const tenantSelection = panel.getRange("panel_inquilino").getValue();
  const month = panel.getRange("panel_mes").getValue();
  const year = panel.getRange("panel_ano").getValue();

  if (!tenantSelection || !month || !year) {
    SpreadsheetApp.getUi().alert(
      "Por favor, selecciona el inquilino, el mes y el año."
    );
    return;
  }

  // Extract numeric tenant ID from "001 - Tenant Name"
  const tenantId = Number(String(tenantSelection).split("-")[0].trim());

  // --- Look up tenant ---
  const tenantData = tenantsSheet.getDataRange().getValues();
  const headers = tenantData[0];

  const idxId = headers.indexOf("ID");
  const idxShortName = headers.indexOf("Nombre corto");
  const idxBase = headers.indexOf("Base (€)");

  // Validate expected columns
  if (idxId === -1 || idxShortName === -1 || idxBase === -1) {
    SpreadsheetApp.getUi().alert(
      "La hoja Inquilinos no tiene las columnas esperadas."
    );
    return;
  }

  const tenantRow = tenantData.find(r => Number(r[idxId]) === tenantId);

  if (!tenantRow) {
    SpreadsheetApp.getUi().alert(
      "No se ha encontrado el inquilino seleccionado."
    );
    return;
  }

  const shortName = tenantRow[idxShortName];
  const baseAmount = Number(tenantRow[idxBase]) || 0;

  // --- VAT ---
  const vatRate = getDefaultVat(); // e.g. 0.21

  // --- Extra concepts ---
  const extrasData = extrasSheet.getDataRange().getValues().slice(1);

  let extrasWithVat = 0;
  let extrasWithoutVat = 0;

  extrasData.forEach(row => {
    const [m, y, tId, , amount, applyVat] = row;

    if (m === month && y === year && Number(tId) === tenantId) {
      const value = Number(amount) || 0;
      if (applyVat === "Sí") {
        extrasWithVat += value;
      } else {
        extrasWithoutVat += value;
      }
    }
  });

  // --- Totals ---
  const taxableBase = baseAmount + extrasWithVat;
  const totalBase = baseAmount + extrasWithVat + extrasWithoutVat;
  const vatAmount = taxableBase * vatRate;

  // --- Create invoice from template ---
  const invoiceName = "FACTURA_PRUEBA_NO_DEFINITIVO";
  const invoiceSpreadsheet = createInvoiceFromTemplate(invoiceName);

  const url = invoiceSpreadsheet.getUrl();
  getPanelSpreadsheet()
    .getRangeByName("panel_last_invoice_url")
    .setValue(url);
  
  showInvoiceSummaryNice({
    shortName,
    month,
    year,
    total: taxableBase + vatAmount,
    url
  });

  // --- Access the first sheet in the template ---
  const invoiceSheet = invoiceSpreadsheet.getSheets()[0];

  SpreadsheetApp.flush();

  // --- Write invoice content ---
  invoiceSheet.getRange("A1").setValue("FACTURA");
  invoiceSheet.getRange("A3").setValue("Inquilino:");

  invoiceSheet.getRange("A4").setValue("Periodo:");

  invoiceSheet.getRange("A6").setValue("Base mensual");

  invoiceSheet.getRange("A7").setValue("Extras con IVA");

  invoiceSheet.getRange("A8").setValue("Extras sin IVA");

  invoiceSheet.getRange("A10").setValue("Base imponible");

  invoiceSheet.getRange("A11").setValue(
    `IVA (${(vatRate * 100).toFixed(0)} %)`
  );

  invoiceSheet.getRange("A13").setValue("TOTAL");

  // --- Formatting (minimal, readable) ---
  invoiceSheet.getRange("A1").setFontSize(14).setFontWeight("bold");
  invoiceSheet.getRange("A13").setFontWeight("bold");
  invoiceSheet.getRange("B6:B13").setNumberFormat("#,##0.00 €");
}

function showInvoiceSummaryNice({ shortName, month, year, total, url }) {
  const html = HtmlService.createHtmlOutput(`
    <div style="
      font-family: system-ui, sans-serif;
      padding: 16px;
      line-height: 1.5
    ">
      <h3 style="margin-top: 0">Factura generada</h3>

      <div style="
        background: #f6f7f8;
        padding: 10px 12px;
        border-radius: 6px;
        margin-bottom: 12px
      ">
        <div><b>Inquilino:</b> ${shortName}</div>
        <div><b>Periodo:</b> ${month} ${year}</div>
        <div><b>Total:</b> ${total.toFixed(2)} €</div>
      </div>

      <div>
        👉 <a href="${url}" target="_blank"
             style="font-weight: 600">
          Abrir factura
        </a>
      </div>
    </div>
  `).setWidth(400).setHeight(260);

  SpreadsheetApp.getUi().showModalDialog(html, "Factura creada");
}


