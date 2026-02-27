# CLAUDE.md
Single source of truth for FacturePro / FactuurPro

## Tech Stack
React + Vite, Tailwind CSS, React Router v6, React Hook Form, i18next, jsPDF.

## Roles
- `facturepro.be`: French (FR)
- `factuurpro.be`: Dutch (NL)
- Controlled via `VITE_BRAND=facturepro` or `VITE_BRAND=factuurpro`. Default languages strictly set.

## Rules
1. No hardcoded UI strings. Use `useTranslation` from `i18next`.
2. All calculations in `src/utils/calculations.js`.
3. PDF generation in `src/utils/pdfGenerator.js`. Minimum margins 18mm, A4 format.
4. Functional components only. Tailwind CSS only. No custom CSS classes unless necessary.
5. All variables like colors mapped correctly in `index.css`.

Phase 1 Scope:
Frontend only. Free and Pro tiers UI. Free PDF generated with watermark. No auth or DB yet.
