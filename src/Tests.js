function testBuildInvoiceDate() {
  const date = buildInvoiceDate_(3, 2026);

  if (date.getFullYear() !== 2026) throw new Error('Año incorrecto');
  if (date.getMonth() !== 2) throw new Error('Mes incorrecto');
  if (date.getDate() !== 1) throw new Error('Día incorrecto');
}

function testBuildPeriodLabel() {
  const label = buildPeriodLabel_(3, 2026);

  if (label !== 'Marzo de 2026') {
    throw new Error('Etiqueta incorrecta: ' + label);
  }
}

function testExtractTenantId() {
  const id = extractTenantId_('001 - Sánchez_Macías');
  if (id !== 1) {
    throw new Error('ID incorrecto: ' + id);
  }
}