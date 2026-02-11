function withMockedTaxes(vat, withholding, fn) {
  const originalVat = getDefaultVat;
  const originalWithholding = getDefaultWithholding;
  
  try {
    getDefaultVat = () => vat;
    getDefaultWithholding = () => withholding;
    
    return fn();
  } finally {
    getDefaultVat = originalVat;
    getDefaultWithholding = originalWithholding;
  }
}

function testCalculateInvoiceTotals_basic() {
  withMockedTaxes(0.21, 0.19, () => {

    const context = {
      concepts: [
        {
          name: "Arrendamiento",
          description: "Base",
          amount: 1000,
          appliesVat: true,
          appliesWithholding: true,
          vatRate: null,
          withholdingRate: null
        }
      ]
    };

    const result = calculateInvoiceTotals(context);

    if (result.totals.base !== 1000) throw new Error("Base incorrecta");
    if (result.totals.vat !== 210) throw new Error("IVA incorrecto");
    if (result.totals.withholding !== 190) throw new Error("Retención incorrecta");
    if (result.totals.grandTotal !== 1020) throw new Error("Total incorrecto");
  });

  Logger.log("✓ testCalculateInvoiceTotals_basic OK");
}

function testCalculateInvoiceTotals_noWithholding() {
  withMockedTaxes(0.21, 0.19, () => {

    const context = {
      concepts: [
        {
          name: "Servicio",
          description: "",
          amount: 100,
          appliesVat: true,
          appliesWithholding: false,
          vatRate: null,
          withholdingRate: null
        }
      ]
    };

    const result = calculateInvoiceTotals(context);

    if (result.totals.base !== 100) throw new Error("Base incorrecta");
    if (result.totals.vat !== 21) throw new Error("IVA incorrecto");
    if (result.totals.withholding !== 0) throw new Error("Retención debería ser 0");
    if (result.totals.grandTotal !== 121) throw new Error("Total incorrecto");
  });

  Logger.log("✓ testCalculateInvoiceTotals_noWithholding OK");
}

function testCalculateInvoiceTotals_rounding() {
  withMockedTaxes(0.21, 0.19, () => {

    const context = {
      concepts: [
        {
          name: "Concepto decimal",
          description: "",
          amount: 333.33,
          appliesVat: true,
          appliesWithholding: false,
          vatRate: null,
          withholdingRate: null
        }
      ]
    };

    const result = calculateInvoiceTotals(context);

    if (result.totals.vat !== 70) {
      throw new Error("IVA mal redondeado");
    }
  });

  Logger.log("✓ testCalculateInvoiceTotals_rounding OK");
}

function testCalculateInvoiceTotals_multipleConcepts() {
  withMockedTaxes(0.21, 0.19, () => {

    const context = {
      concepts: [
        {
          name: "Base",
          description: "",
          amount: 1000,
          appliesVat: true,
          appliesWithholding: true,
          vatRate: null,
          withholdingRate: null
        },
        {
          name: "Extra",
          description: "",
          amount: 100,
          appliesVat: true,
          appliesWithholding: false,
          vatRate: null,
          withholdingRate: null
        }
      ]
    };

    const result = calculateInvoiceTotals(context);

    if (result.totals.base !== 1100) throw new Error("Base total incorrecta");
    if (result.totals.vat !== 231) throw new Error("IVA total incorrecto");
    if (result.totals.withholding !== 190) throw new Error("Retención total incorrecta");
    if (result.totals.grandTotal !== 1141) throw new Error("Total final incorrecto");
  });

  Logger.log("✓ testCalculateInvoiceTotals_multipleConcepts OK");
}

function testBuildInvoiceDate() {
  const date = buildInvoiceDate_(3, 2026);

  if (date.getFullYear() !== 2026) throw new Error('Año incorrecto');
  if (date.getMonth() !== 2) throw new Error('Mes incorrecto');
  if (date.getDate() !== 1) throw new Error('Día incorrecto');

  Logger.log("✓ testBuildInvoiceDate OK");
}

function testBuildPeriodLabel() {
  const label = buildPeriodLabel_(3, 2026);

  if (label !== 'Marzo de 2026') {
    throw new Error('Etiqueta incorrecta: ' + label);
  }

  Logger.log("✓ testBuildPeriodLabel OK");
}

function testExtractTenantId() {
  const id = extractTenantId_('001 - Sánchez_Macías');
  if (id !== 1) {
    throw new Error('ID incorrecto: ' + id);
  }

  Logger.log("✓ testExtractTenantId OK");
}