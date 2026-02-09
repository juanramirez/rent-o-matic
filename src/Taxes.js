function getConfigValue(key, label) {
  const range = getPanelSpreadsheet().getRangeByName(key);
  if (!range) {
    throw new Error(`${label} no definido (${key})`);
  }
  return range.getValue();
}

function getDefaultVat() {
  const vat = getConfigValue("DEFAULT_VAT", "IVA por defecto");
  if (typeof vat !== "number" || vat <= 0 || vat >= 1) {
    throw new Error("IVA inválido");
  }
  return vat;
}

function getDefaultWithholding() {
  const value = getConfigValue(
    "DEFAULT_TAX_WITHHOLDING",
    "Retención por defecto"
  );
  if (typeof value !== "number" || value <= 0 || value >= 1) {
    throw new Error("Retención inválida");
  }
  return value;
}
