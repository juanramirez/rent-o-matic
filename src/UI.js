function showInvoiceSummaryDialog({ shortName, month, year, total, url }) {
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: system-ui; padding: 16px">
      <h3>Factura generada</h3>
      <p><b>${shortName}</b></p>
      <p>${month} ${year}</p>
      <p><b>${total.toFixed(2)} €</b></p>
      <hr>
      <a href="${url}" target="_blank">Abrir factura</a>
    </div>
  `).setWidth(380).setHeight(260);

  SpreadsheetApp.getUi().showModalDialog(html, "Factura");
}
