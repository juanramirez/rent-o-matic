function getTenantShortNameById(tenantId) {
  const sheet = getPanelSpreadsheet().getSheetByName("Inquilinos");
  if (!sheet) throw new Error("No se encuentra la hoja Inquilinos");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idxId = headers.indexOf("ID");
  const idxShortName = headers.indexOf("Nombre corto");

  const row = data.find((r, i) =>
    i > 0 && Number(r[idxId]) === Number(tenantId)
  );

  if (!row) {
    throw new Error(`Inquilino ${tenantId} no encontrado`);
  }

  return row[idxShortName];
}
