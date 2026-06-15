/** Styles embarqués pour l'impression du certificat pro-forma (sans dépendre de Tailwind CDN). */
export const DECLARATION_PRINT_CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #111827;
    background: #fff;
    margin: 0;
    padding: 32px;
    font-size: 12px;
    line-height: 1.5;
  }
  .cert-sheet {
    max-width: 800px;
    margin: 0 auto;
    border: 2px solid #374151;
    padding: 40px 48px;
  }
  .cert-header {
    text-align: center;
    border-bottom: 2px dashed #9ca3af;
    padding-bottom: 20px;
    margin-bottom: 24px;
  }
  .cert-header .regime {
    color: #6d28d9;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .cert-header h1 {
    font-size: 20px;
    font-weight: 800;
    margin: 8px 0 4px;
    letter-spacing: 0.02em;
  }
  .cert-header .ref {
    font-size: 10px;
    color: #6b7280;
    font-family: ui-monospace, monospace;
  }
  .cert-banner {
    padding: 14px 16px;
    border-radius: 6px;
    margin-bottom: 24px;
    border: 1px solid;
  }
  .cert-banner.ok { background: #f5f3ff; border-color: #a78bfa; color: #4c1d95; }
  .cert-banner.ko { background: #fff1f2; border-color: #fda4af; color: #9f1239; }
  .cert-banner strong { display: block; font-size: 11px; margin-bottom: 4px; }
  .cert-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  .cert-grid h2 {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    margin: 0 0 8px;
  }
  .cert-grid .name { font-weight: 700; font-size: 13px; }
  .cert-grid .sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .cert-box {
    margin-top: 12px;
    padding: 10px 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-family: ui-monospace, monospace;
    font-size: 11px;
  }
  .cert-box .muted { font-size: 10px; color: #6b7280; margin-top: 4px; }
  .cert-section-title {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
    margin: 0 0 10px;
    font-weight: 700;
  }
  .cert-origin-report {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 24px;
  }
  .cert-origin-report .row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid #e5e7eb;
    font-family: ui-monospace, monospace;
    font-size: 11px;
  }
  .cert-origin-report .row:last-child { border-bottom: none; }
  table.cert-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 11px;
  }
  table.cert-table th {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    padding: 10px 14px;
    text-align: left;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #4b5563;
  }
  table.cert-table th:not(:first-child) { text-align: right; }
  table.cert-table td {
    border: 1px solid #e5e7eb;
    padding: 10px 14px;
    vertical-align: middle;
  }
  table.cert-table td.num { text-align: right; font-family: ui-monospace, monospace; white-space: nowrap; }
  table.cert-table tr.total td {
    font-weight: 700;
    background: #f9fafb;
    border-top: 2px solid #374151;
    padding-top: 12px;
    padding-bottom: 12px;
  }
  table.cert-table tr.total .total-xaf {
    font-size: 13px;
    color: #6d28d9;
  }
  table.cert-table tr.total .total-usd {
    font-size: 10px;
    font-weight: 400;
    color: #6b7280;
    display: block;
    margin-top: 2px;
  }
  .cert-footer {
    border-top: 1px dashed #9ca3af;
    padding-top: 16px;
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #6b7280;
    font-family: ui-monospace, monospace;
  }
  @media print {
    body { padding: 0; }
    .cert-sheet { border: none; padding: 24px; }
  }
`;
