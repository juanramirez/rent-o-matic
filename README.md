# rent-o-matic 🧾

**rent-o-matic** is a small personal automation project to generate rent invoices using  
**Google Sheets + Google Apps Script**, designed for real-world use by small landlords.

It started as a personal tool and grew into a clean, modular Apps Script project,
now versioned with Git and synced via `clasp`.

---

## ✨ Features

- 📊 Central **billing panel** in Google Sheets
- 🧑‍💼 Tenant management (base rent, identifiers, short names)
- ➕ Extra billable concepts (with or without VAT)
- 🧮 Automatic calculation of:
  - taxable base
  - VAT
  - totals
- 📄 Invoice generation from a **template spreadsheet**
- 🔗 Direct link to the generated invoice
- 🗂 Clean, modular Apps Script codebase

---

## 🧠 Project structure

The codebase is intentionally split by domain:


The original monolithic implementation existed in the early stages of the project
and is preserved in Git history for reference.

## 🧩 Code structure

- Config.js   – Global configuration and constants.
- Panel.js    – Main panel access and input handling.
- Tenants.js  – Tenant lookup and data access.
- Taxes.js    – VAT and withholding logic.
- Invoice.js  – Invoice generation logic.
- Drive.js    – Drive / file / folder helpers.
- UI.js       – Dialogs and UI helpers.
- Utils.js    – Small shared utilities.

---

## 🚀 How it works (high level)

1. The user selects:
   - tenant
   - month
   - year  
   from a **billing panel** spreadsheet.
2. The script:
   - reads tenant data
   - aggregates extra concepts
   - calculates totals and VAT
3. A new invoice spreadsheet is created from a template.
4. A dialog shows a summary and a direct link to the invoice.

---

## 🔧 Tech stack

- **Google Apps Script**
- **Google Sheets**
- **Google Drive**
- **Git + GitHub**
- **clasp** (Command Line Apps Script)

---

## 🔐 Configuration & secrets

This repository **does not include**:
- `.clasp.json`
- spreadsheet IDs
- Drive folder IDs

Those are intentionally excluded and must be provided per deployment.

---

## 📦 Status

This is a **working, real-life tool**, not a polished SaaS product.
The focus is on clarity, maintainability and correctness.

Contributions, suggestions and forks are welcome.

---

## 📄 License

TBD (likely MIT).


