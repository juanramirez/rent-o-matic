function withMockedProperties(fn) {
  const original = getScriptProperties_;

  const fakeStore = {};

  getScriptProperties_ = () => ({
    getProperty: key => fakeStore[key] || null,
    setProperty: (key, value) => {
      fakeStore[key] = value;
    }
  });

  try {
    return fn();
  } finally {
    getScriptProperties_ = original;
  }
}

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

function testInvoiceNumbering_basic() {
  withMockedProperties(() => {
    const year = 2026;

    const id1 = peekNextInvoiceId(year);
    const id2 = peekNextInvoiceId(year);
    const id3 = peekNextInvoiceId(year);

    if (id1 !== '1-2026') throw new Error('Primer ID incorrecto: ' + id1);
    if (id2 !== '2-2026') throw new Error('Segundo ID incorrecto: ' + id2);
    if (id3 !== '3-2026') throw new Error('Tercer ID incorrecto: ' + id3);

    Logger.log("✓ testInvoiceNumbering_basic OK");
  });
}

function testInvoiceNumbering_newYear() {
  withMockedProperties(() => {
    const id1 = peekNextInvoiceId(2026);
    const id2 = peekNextInvoiceId(2026);
    const id3 = peekNextInvoiceId(2027);

    if (id1 !== '1-2026') throw new Error('Primer ID de 2026 incorrecto: ' + id1);
    if (id2 !== '2-2026') throw new Error('Segundo ID de 2026 incorrecto: ' + id2);
    if (id3 !== '1-2027') throw new Error('Primer ID de 2027 incorrecto: ' + id3);

    Logger.log("✓ testInvoiceNumbering_newYear OK");
  });
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

function testGenerateInvoicePreview() {
  withMockedTaxes(0.21, 0.19, () => {

    const context = {
      tenantId: 1,
      tenantShortName: "Test",
      tenantFiscalName: "Test S.L.",
      tenantTaxId: "B12345678",
      tenantAddress: "Calle Falsa 123",
      invoiceDate: new Date(2026, 1, 1),
      periodLabel: "Febrero de 2026",
      concepts: [
        {
          name: "Arrendamiento",
          description: "Alquiler local",
          amount: 1000,
          appliesVat: true,
          appliesWithholding: true,
          vatRate: null,
          withholdingRate: null
        },
        {
          name: "Extra",
          description: "Gastos varios",
          amount: 100,
          appliesVat: true,
          appliesWithholding: false,
          vatRate: null,
          withholdingRate: null
        }
      ]
    };

    calculateInvoiceTotals(context);
  });

  Logger.log("✓ testGenerateInvoicePreview OK");
}

function testInvoiceAlreadyExistsForPeriod_true() {
  const fakeTenantName = "Tenant Smith";
  const fakeFiles = [
    { getName: () => `${fakeTenantName} 2026-02` },
    { getName: () => `${fakeTenantName} 2026-01` }
  ];

  const fakeFolder = {
    getFiles: () => ({
      index: 0,
      hasNext: function() { return this.index < fakeFiles.length; },
      next: function() { return fakeFiles[this.index++]; }
    })
  };

  const originalGetTenantFolder = getTenantFolder;

  try {
    getTenantFolder = () => fakeFolder;

    const exists = invoiceExistsForPeriod(1, fakeTenantName, 2026, 2);

    if (exists !== true) {
      throw new Error("It should have found the existing invoice.");
    }
  } finally {
    getTenantFolder = originalGetTenantFolder;
  }

  Logger.log("✓ testInvoiceAlreadyExistsForPeriod_true OK");
}

function testInvoiceIdNotIncrementedOnFailure() {
  const year = 2026;

  const originalCommit = commitInvoiceId;
  const originalGenerateInvoicePdf = generateInvoicePdf;
  const originalGenerateInvoiceSpreadsheet = generateInvoiceSpreadsheet;
  const originalMoveFileToFolder_ = moveFileToFolder_;
  const originalGetTenantFolder = getTenantFolder;
  const originalReadBillingContext = readBillingContext;

  try {
    readBillingContext = () => ({
      tenantId: 1,
      tenantShortName: "Test",
      invoiceDate: new Date(year, 0, 1), // Jan 1, 2026
      concepts: []
    });
    getTenantFolder = () => ({
      getFiles: function() {
        return {
          hasNext: function() { return false; },
          next: function() { return null; }
        };
      }
    });
    moveFileToFolder_ = () => {}; // Skip actual file operations
    generateInvoiceSpreadsheet = () => ({ getId: () => 'dummy-id' }); // Dummy spreadsheet
    generateInvoicePdf = () => { throw new Error("Simulated generation failure"); }

    const before = peekNextInvoiceId(year);
    // Generation error simulation
    generateInvoicePdf = () => {
      throw new Error("Simulated generation failure");
    };

    // We expect an error to be thrown
    let errorThrown = false;
    try {
      createInvoice();
    } catch (e) {
      errorThrown = true;
      if (e.message !== "Simulated generation failure") {
        throw new Error("Unexpected error message: " + e.message);
      }
    }

    const after = peekNextInvoiceId(year);

    if (before !== after) {
      throw new Error(`Invoice ID was incremented despite failure. Before: ${before}, After: ${after}`);
    }
  } finally {
    commitInvoiceId = originalCommit;
    generateInvoicePdf = originalGenerateInvoicePdf;
    generateInvoiceSpreadsheet = originalGenerateInvoiceSpreadsheet;
    moveFileToFolder_ = originalMoveFileToFolder_;
    getTenantFolder = originalGetTenantFolder;
  }

  Logger.log("✓ testInvoiceIdNotIncrementedOnFailure OK");
}

function testInvoiceExistsForPeriod_detectsDuplicate() {
  const originalList = listTenantInvoiceFileNames;

  try {
    listTenantInvoiceFileNames = () => [
      'Inquilino Martínez 2026-02',
      'Inquilino Martínez 2026-01'
    ];

    const exists = invoiceExistsForPeriod(1, 'Inquilino Martínez', 2026, 2);

    if (!exists) {
      throw new Error("Duplicate not detected");
    }
  } finally {
    listTenantInvoiceFileNames = originalList;
  }
}

function testInvoiceAlreadyExists_true() {
  const fakeFolder = {
    getFilesByName: name => ({
      hasNext: () => true
    })
  };

  const result = invoiceAlreadyExists("any-name", fakeFolder);

  if (result !== true) {
    throw new Error("It should have found the file.");
  }

  Logger.log("✓ testInvoiceAlreadyExists_true OK");
}

function testInvoiceAlreadyExists_false() {
  const fakeFolder = {
    getFilesByName: name => ({
      hasNext: () => false
    })
  };
  
  const result = invoiceAlreadyExists("any-name", fakeFolder);

  if (result !== false) {
    throw new Error("It should not have found the file.");
  }

  Logger.log("✓ testInvoiceAlreadyExists_false OK");
}

function runAllTests() {
  testInvoiceNumbering_basic();
  testInvoiceNumbering_newYear();
  testCalculateInvoiceTotals_basic();
  testCalculateInvoiceTotals_noWithholding();
  testCalculateInvoiceTotals_rounding();
  testCalculateInvoiceTotals_multipleConcepts();
  testBuildInvoiceDate();
  testBuildPeriodLabel();
  testExtractTenantId();
  testGenerateInvoicePreview();
  testInvoiceAlreadyExistsForPeriod_true();
  testInvoiceIdNotIncrementedOnFailure();
  testInvoiceExistsForPeriod_detectsDuplicate();
  testInvoiceAlreadyExists_true();
  testInvoiceAlreadyExists_false();
  Logger.log("🚀 ALL TESTS OK");
}
