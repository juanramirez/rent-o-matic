# 🗺️ rent-o-matic — Roadmap

## Vision

rent-o-matic aims to evolve from a simple invoice-generation script into a small, maintainable, configurable invoicing engine built on Google Apps Script.  
The focus is on clarity, reproducibility, and long-term extensibility.

---

# ✅ v1 — Stable MVP

Core functionality and working baseline.

## 1. Basic Invoice Generation
- Select:
  - Tenant
  - Year
  - Month
- Generate invoice as:
  - Google Spreadsheet
  - PDF exported from Spreadsheet

## 2. Structured Invoice Data Model

Base structure:

```json
{
  "tenant": "",
  "name": "",
  "period": "",
  "concepts": [],
  "type": "",
  "description": "",
  "totals": {}
}
```

- Clear separation between:
  - Concepts
  - Totals
  - Metadata

## 3. Extra Concepts with Simple Recurrence
- Support for repeating concepts:
  - Fixed number of months
- No advanced recurrence engine (yet)

## 4. Git Versioning (clasp integration)
- Sync Apps Script project with GitHub
- Local development workflow
- Clean version history

---

# 🚧 v2 — Professionalization

Focus: maintainability, UX, and architectural cleanliness.

## 5. UI Redesign with Live Preview
- Show invoice preview below:
  - Tenant selector
  - Year selector
  - Month selector
- Render invoice in HTML before PDF generation
- Improve user confidence and UX

## 6. Programmatic Invoice Layout
Generate invoice formatting entirely via code:
- Cell sizes
- Borders
- Fonts
- Colors
- Margins
- Alignment

Goal:
- Reproducible design
- No manual layout dependency
- Easier refactoring

## 7. Config-Driven Fields (Decoupled from Layout)
Make invoice structure configurable via a config file:
- Visible fields
- Field order
- Labels
- Currency format
- Show / hide sections

Goal:
- Data independent from presentation
- Easier customization

## 8. Tenant Data in Separate Spreadsheet
- Separate:
  - Configuration & tenant data
  - Generated invoices
- Better separation of concerns
- Easier scaling

## 9. Internationalization (i18n)
- Multi-language support (ES / EN initially)
- Translatable labels
- Locale-based:
  - Date formatting
  - Currency formatting

---

# 🧠 v3 — Scalability & Advanced Features

Focus: robustness and growth.

## 10. Advanced Recurrence Engine
- Monthly / yearly recurrence
- End date support
- Optional automatic expiration
- Future: CPI/index-based updates

## 11. Persistent JSON Storage (Optional Layer)
- Store invoice data as JSON
- Enable:
  - Audit trail
  - External integrations
  - Future API exposure

## 12. Validation & Error Handling Improvements
- Prevent duplicate invoice generation
- Validate tenant existence
- Detect already-invoiced periods
- Better logging
- UI-level error feedback

## 13. Multi-Property / Multi-Unit Support
- Support multiple properties
- Tenant grouping
- Future scalability

---

# 🎯 Strategic Priorities

High impact structural improvements:
1. Programmatic layout
2. Config-driven fields
3. UI preview

These transform rent-o-matic from a useful script into a configurable invoice engine.

---

# 📌 Long-Term Possibility

- Turn into a reusable template
- Open-source project
- Lightweight SaaS-style internal tool

