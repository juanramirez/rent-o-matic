/*
    Responsibility: assigning invoice numbers to new invoices,
    and keeping track of the last assigned number.

    Invoice numbers should be:
    - Persistent.
    - Atomic.
    - Reliable.

    This file will contain:
    - getNextInvoiceNumber: returns the next invoice number to be assigned.
    - store (Properties / Sheets / Drive)

    It will not:
    - Create invoices.
    - Handle layout or formatting.
*/

const INVOICE_COUNT_PREFIX = 'INVOICE_COUNT_';

function getInvoiceYear(invoiceDate) {
    return invoiceDate.getFullYear();
}

function getNextInvoiceOrdinalForYear(year) {
    const lock = LockService.getScriptLock();

    try {
        lock.waitLock(30000); // wait up to 30 seconds to acquire the lock
    
        const properties = PropertiesService.getScriptProperties();
        const key = INVOICE_COUNT_PREFIX + year;

        const currentInvoiceCount = Number(properties.getProperty(key)) || 0;
        const nextCount = currentInvoiceCount + 1;
        
        properties.setProperty(key, String(nextCount));

        return nextCount;
    } finally {
        lock.releaseLock();
    }
}

function getNextInvoiceId(year) {
  const props = PropertiesService.getScriptProperties();
  const key = `INVOICE_COUNTER_${year}`;

  const current = Number(props.getProperty(key)) || 0;
  const next = current + 1;

  props.setProperty(key, next);

  return `${next}-${year}`;
}

function debugNextInvoiceId() {
  const fakeDate = new Date('2026-01-15');
  const year = getInvoiceYear(fakeDate);
  const id = getNextInvoiceId(year);
  Logger.log(`Generated invoice ID: ${id}`);
}
