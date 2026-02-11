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

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateInvoiceTotals(context) {
  const vatDefault = getDefaultVat();
  const withholdingDefault = getDefaultWithholding();

  const lines = [];

  let baseTotal = 0;
  let vatTotal = 0;
  let withholdingTotal = 0;

  context.concepts.forEach(concept => {
    const base = roundMoney(concept.amount);

    const vatRate = concept.appliesVat
      ? (concept.vatRate ?? vatDefault)
      : 0;

    const withholdingRate = concept.appliesWithholding
      ? (concept.withholdingRate ?? withholdingDefault)
      : 0;

    const vat = roundMoney(base * vatRate);
    const withholding = roundMoney(base * withholdingRate);
    const total = roundMoney(base + vat - withholding);

    baseTotal += base;
    vatTotal += vat;
    withholdingTotal += withholding;

    lines.push({
      name: concept.name,
      description: concept.description,
      base,
      vat,
      withholding,
      total
    });
  });

  baseTotal = roundMoney(baseTotal);
  vatTotal = roundMoney(vatTotal);
  withholdingTotal = roundMoney(withholdingTotal);

  return {
    lines,
    totals: {
      base: baseTotal,
      vat: vatTotal,
      withholding: withholdingTotal,
      grandTotal: roundMoney(baseTotal + vatTotal - withholdingTotal)
    }
  };
}
