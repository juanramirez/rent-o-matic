function getPanelSpreadsheet() {
  return SpreadsheetApp.openById(PANEL_SPREADSHEET_ID);
}

function getMainPanelSheet() {
  const sheet = getPanelSpreadsheet()
    .getSheetByName(MAIN_PANEL_SHEET_NAME);
  if (!sheet) {
    throw new Error(`No se encuentra ${MAIN_PANEL_SHEET_NAME}`);
  }
  return sheet;
}
