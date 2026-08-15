import { Order } from '../types/ecommerce';

export type ReceiptTemplate = 'formal_invoice' | 'thermal_pos' | 'packing_slip' | 'gift_receipt';

export interface ReceiptOptions {
  template?: ReceiptTemplate;
  companyName?: string;
  taxNumber?: string;
  storeAddress?: string;
  supportEmail?: string;
  supportPhone?: string;
  showPrices?: boolean;
  includeWarrantySeal?: boolean;
  notes?: string;
}

const DEFAULT_OPTIONS: Required<ReceiptOptions> = {
  template: 'formal_invoice',
  companyName: 'AURA Atelier Haute Horology & Acoustics',
  taxNumber: 'US-TAX-8849102-AU / VAT #EU-99201948',
  storeAddress: '740 Sansome St, Suite 600, San Francisco, CA 94111',
  supportEmail: 'concierge@aura-atelier.com',
  supportPhone: '+1 (800) 840-AURA',
  showPrices: true,
  includeWarrantySeal: true,
  notes: 'Thank you for choosing AURA. All pieces include a 2-year atelier warranty and 30-day complimentary returns.',
};

/**
 * Formats currency for receipts
 */
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Generates an SVG Barcode for printing
 */
const generateBarcodeSVG = (code: string): string => {
  // Generate a realistic visual bar pattern based on code characters
  const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const bars: string[] = [];
  let x = 10;
  
  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    const width1 = (charCode % 3) + 1.5;
    const width2 = ((charCode * 3) % 4) + 1;
    bars.push(`<rect x="${x}" y="0" width="${width1}" height="40" fill="#111" />`);
    x += width1 + 2;
    bars.push(`<rect x="${x}" y="0" width="${width2}" height="40" fill="#111" />`);
    x += width2 + 2.5;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(x + 10, 180)} 50" class="barcode-svg" style="height: 38px; max-width: 220px;">
      ${bars.join('')}
    </svg>
  `;
};

/**
 * Generates a full standalone HTML receipt document with inlined print styles
 */
export const generateReceiptHTML = (order: Order, customOptions?: ReceiptOptions): string => {
  const opts: Required<ReceiptOptions> = { ...DEFAULT_OPTIONS, ...customOptions };
  const isGift = opts.template === 'gift_receipt' || !opts.showPrices;
  const isThermal = opts.template === 'thermal_pos';
  const isPackingSlip = opts.template === 'packing_slip';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const barcodeSVG = generateBarcodeSVG(order.orderNumber);
  const trackingBarcodeSVG = generateBarcodeSVG(order.trackingNumber);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - Order ${order.orderNumber} - ${opts.companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #fcfbf9;
      color: #1c1917;
      font-size: 13px;
      line-height: 1.5;
      padding: ${isThermal ? '16px 12px' : '32px'};
      -webkit-font-smoothing: antialiased;
    }

    .receipt-container {
      max-width: ${isThermal ? '320px' : '780px'};
      margin: 0 auto;
      background: #ffffff;
      padding: ${isThermal ? '20px 16px' : '40px 48px'};
      border: 1px solid #e7e5e4;
      border-radius: ${isThermal ? '8px' : '16px'};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    /* Print styling rules */
    @media print {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .receipt-container {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        padding: ${isThermal ? '10px' : '20px'} !important;
      }
      .no-print {
        display: none !important;
      }
      @page {
        margin: ${isThermal ? '5mm' : '12mm'};
        size: ${isThermal ? '80mm auto' : 'auto'};
      }
    }

    /* Header */
    .header {
      display: flex;
      flex-direction: ${isThermal ? 'column' : 'row'};
      justify-content: space-between;
      align-items: ${isThermal ? 'center' : 'flex-start'};
      border-bottom: 2px solid #1c1917;
      padding-bottom: 20px;
      margin-bottom: 24px;
      text-align: ${isThermal ? 'center' : 'left'};
    }

    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: ${isThermal ? '18px' : '24px'};
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #1c1917;
    }

    .brand-sub {
      font-size: 11px;
      color: #78716c;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    .doc-type-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background-color: #1c1917;
      color: #fef08a;
      padding: 4px 12px;
      border-radius: 4px;
      margin-top: ${isThermal ? '10px' : '0'};
    }

    /* Metadata Grid */
    .meta-grid {
      display: grid;
      grid-template-columns: ${isThermal ? '1fr' : 'repeat(3, 1fr)'};
      gap: 16px;
      background-color: #fbfaf8;
      border: 1px solid #e7e5e4;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .meta-item label {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #78716c;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .meta-item value {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #1c1917;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Address Section */
    .addresses {
      display: grid;
      grid-template-columns: ${isThermal ? '1fr' : '1fr 1fr'};
      gap: 20px;
      margin-bottom: 24px;
    }

    .address-card {
      border-left: 3px solid #d97706;
      padding-left: 12px;
    }

    .address-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #78716c;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .address-name {
      font-weight: 700;
      color: #1c1917;
      margin-bottom: 2px;
    }

    .address-details {
      font-size: 12px;
      color: #44403c;
      line-height: 1.4;
    }

    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    .items-table th {
      background-color: #f5f5f4;
      color: #44403c;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #d6d3d1;
    }

    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #f5f5f4;
      font-size: 12px;
      vertical-align: middle;
    }

    .items-table .text-right {
      text-align: right;
    }

    .items-table .text-center {
      text-align: center;
    }

    .item-name {
      font-weight: 600;
      color: #1c1917;
    }

    .item-sku {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #78716c;
      margin-top: 1px;
    }

    .item-variant {
      display: inline-block;
      font-size: 10px;
      background-color: #f5f5f4;
      color: #57534e;
      padding: 1px 6px;
      border-radius: 3px;
      margin-top: 2px;
    }

    /* Summary Calculation */
    .summary-section {
      display: flex;
      flex-direction: ${isThermal ? 'column' : 'row'};
      justify-content: space-between;
      gap: 20px;
      border-top: 2px solid #e7e5e4;
      padding-top: 20px;
      margin-bottom: 24px;
    }

    .summary-notes {
      flex: 1;
      font-size: 11px;
      color: #78716c;
      line-height: 1.6;
    }

    .summary-totals {
      width: ${isThermal ? '100%' : '280px'};
      space-y: 6px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      color: #44403c;
    }

    .total-row.grand-total {
      font-size: 16px;
      font-weight: 700;
      color: #1c1917;
      border-top: 2px solid #1c1917;
      border-bottom: 2px solid #1c1917;
      padding: 8px 0;
      margin-top: 8px;
    }

    .total-row .font-mono {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }

    .discount-val {
      color: #059669;
    }

    /* Barcode & Seal */
    .footer-barcodes {
      display: flex;
      flex-direction: ${isThermal ? 'column' : 'row'};
      align-items: center;
      justify-content: space-between;
      border-top: 1px dashed #d6d3d1;
      padding-top: 20px;
      margin-top: 20px;
      text-align: center;
      gap: 16px;
    }

    .barcode-block {
      text-align: center;
    }

    .barcode-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #78716c;
      letter-spacing: 0.1em;
      margin-top: 4px;
    }

    .seal-box {
      border: 2px solid #b45309;
      border-radius: 8px;
      padding: 8px 16px;
      text-align: center;
      background: #fffbeb;
    }

    .seal-title {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 700;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .seal-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #b45309;
      font-weight: 600;
    }

    .footer-contact {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #a8a29e;
      line-height: 1.5;
    }

    /* Thermal adjustments */
    ${isThermal ? `
      .items-table th, .items-table td {
        padding: 6px 4px;
        font-size: 11px;
      }
      .barcode-svg {
        max-width: 160px;
      }
    ` : ''}
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">AURA ATELIER</div>
        <div class="brand-sub">${opts.companyName}</div>
        <div class="brand-sub">${opts.storeAddress}</div>
        <div class="brand-sub">Tax Registration: ${opts.taxNumber}</div>
      </div>
      <div style="text-align: ${isThermal ? 'center' : 'right'};">
        <div class="doc-type-badge">
          ${isGift ? 'Gift Receipt' : isPackingSlip ? 'Warehouse Dispatch Slip' : 'Official Tax Invoice'}
        </div>
        <div style="font-size: 11px; color: #78716c; margin-top: 6px; font-family: 'JetBrains Mono', monospace;">
          ${orderDate}
        </div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <div class="meta-grid">
      <div class="meta-item">
        <label>Order Number</label>
        <value>${order.orderNumber}</value>
      </div>
      <div class="meta-item">
        <label>Tracking ID</label>
        <value>${order.trackingNumber}</value>
      </div>
      <div class="meta-item">
        <label>Fulfillment Stage</label>
        <value style="color: ${order.status === 'Delivered' ? '#059669' : '#d97706'}; font-weight: 700;">
          ${order.status.toUpperCase()}
        </value>
      </div>
      <div class="meta-item">
        <label>Courier Service</label>
        <value>${order.shippingMethod}</value>
      </div>
      <div class="meta-item">
        <label>Payment Method</label>
        <value>${order.paymentMethod} •••• ${order.paymentLast4}</value>
      </div>
      <div class="meta-item">
        <label>Estimated Arrival</label>
        <value>${order.estimatedDeliveryDate}</value>
      </div>
    </div>

    <!-- Addresses -->
    <div class="addresses">
      <div class="address-card">
        <div class="address-title">Recipient & Shipping Destination</div>
        <div class="address-name">${order.shippingDetails.fullName}</div>
        <div class="address-details">
          ${order.shippingDetails.address}${order.shippingDetails.apartment ? `, ${order.shippingDetails.apartment}` : ''}<br>
          ${order.shippingDetails.city}, ${order.shippingDetails.state} ${order.shippingDetails.zipCode}<br>
          ${order.shippingDetails.country}<br>
          Tel: ${order.shippingDetails.phone}
        </div>
      </div>

      <div class="address-card" style="border-left-color: #0284c7;">
        <div class="address-title">Customer Billing & Account</div>
        <div class="address-name">${order.customerName}</div>
        <div class="address-details">
          Email: ${order.customerEmail}<br>
          Authorized Via: 256-Bit SSL Tokenization<br>
          Transaction Status: Settled & Verified<br>
          Ref Token: AUTH-${order.id.slice(-8).toUpperCase()}
        </div>
      </div>
    </div>

    <!-- Items Purchased Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45%;">Item Description</th>
          <th class="text-center" style="width: 15%;">SKU</th>
          <th class="text-center" style="width: 10%;">Qty</th>
          ${!isGift ? `
            <th class="text-right" style="width: 15%;">Unit Price</th>
            <th class="text-right" style="width: 15%;">Total</th>
          ` : `
            <th class="text-right" style="width: 30%;">Warranty Token</th>
          `}
        </tr>
      </thead>
      <tbody>
        ${order.items.map((item) => `
          <tr>
            <td>
              <div class="item-name">${item.name}</div>
              ${item.selectedColor ? `<span class="item-variant">Color: ${item.selectedColor}</span>` : ''}
              ${item.selectedSize ? `<span class="item-variant">Size: ${item.selectedSize}</span>` : ''}
            </td>
            <td class="text-center">
              <div class="item-sku">${item.sku}</div>
            </td>
            <td class="text-center font-mono" style="font-weight: 600;">
              ${item.quantity}
            </td>
            ${!isGift ? `
              <td class="text-right font-mono">${formatMoney(item.price)}</td>
              <td class="text-right font-mono" style="font-weight: 700;">${formatMoney(item.price * item.quantity)}</td>
            ` : `
              <td class="text-right font-mono" style="font-size: 11px; color: #059669;">ACTIVE-WRTY-PASS</td>
            `}
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Financial Calculation or Packing Checklist -->
    ${!isGift ? `
      <div class="summary-section">
        <div class="summary-notes">
          <strong style="color: #1c1917; font-size: 11px;">Atelier Notes & Policy:</strong><br>
          ${opts.notes}
        </div>

        <div class="summary-totals">
          <div class="total-row">
            <span>Items Subtotal</span>
            <span class="font-mono">${formatMoney(order.subtotal)}</span>
          </div>

          ${order.discount > 0 ? `
            <div class="total-row discount-val">
              <span>Coupon Discount (${order.couponCode || 'PROMO'})</span>
              <span class="font-mono">-${formatMoney(order.discount)}</span>
            </div>
          ` : ''}

          <div class="total-row">
            <span>Shipping & Handling</span>
            <span class="font-mono">${order.shippingFee === 0 ? 'FREE' : formatMoney(order.shippingFee)}</span>
          </div>

          <div class="total-row">
            <span>Estimated Sales Tax (8%)</span>
            <span class="font-mono">${formatMoney(order.tax)}</span>
          </div>

          <div class="total-row grand-total">
            <span>Total Paid (USD)</span>
            <span class="font-mono">${formatMoney(order.total)}</span>
          </div>
        </div>
      </div>
    ` : `
      <div class="summary-section">
        <div class="summary-notes">
          <strong style="color: #1c1917; font-size: 11px;">Gift Exchange Terms:</strong><br>
          This gift receipt allows complimentary returns and exchanges within 45 days of receipt. Gift recipients may present this barcode at any AURA boutique or online concierge.
        </div>
      </div>
    `}

    <!-- Barcode and Authenticity Seal -->
    <div class="footer-barcodes">
      <div class="barcode-block">
        ${barcodeSVG}
        <div class="barcode-label">ORDER * ${order.orderNumber} *</div>
      </div>

      ${opts.includeWarrantySeal ? `
        <div class="seal-box">
          <div class="seal-title">AURA Authenticity Seal</div>
          <div class="seal-code">SERIAL: AUR-${order.id.slice(0, 10).toUpperCase()}</div>
          <div style="font-size: 8px; color: #78716c; margin-top: 2px;">Hand-Inspected & Certified</div>
        </div>
      ` : ''}

      <div class="barcode-block">
        ${trackingBarcodeSVG}
        <div class="barcode-label">TRACK * ${order.trackingNumber} *</div>
      </div>
    </div>

    <!-- Support Footer -->
    <div class="footer-contact">
      ${opts.companyName} • ${opts.storeAddress}<br>
      Concierge Support: ${opts.supportEmail} • ${opts.supportPhone}<br>
      Electronic Receipt ID: ${order.id} • Printed from AURA Cloud Atelier
    </div>
  </div>
</body>
</html>`;
};

/**
 * Direct print function that invokes the native browser print dialog
 * using an isolated, non-intrusive hidden iframe
 */
export const printOrderReceipt = (order: Order, options?: ReceiptOptions): void => {
  const html = generateReceiptHTML(order, options);

  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', 'Receipt Print Frame');

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    // Fallback: popup window if iframe is blocked
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Trigger print after iframe renders fonts and layout
  iframe.contentWindow?.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print failed, falling back to window.print', e);
      window.print();
    } finally {
      // Clean up iframe after printing dialog closes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 350);
};

/**
 * Triggers a download of the styled standalone HTML receipt
 */
export const downloadReceiptHTML = (order: Order, options?: ReceiptOptions): void => {
  const html = generateReceiptHTML(order, options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AURA-Receipt-${order.orderNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates clean ASCII plain-text receipt for clipboard / terminal copying
 */
export const generateReceiptPlainText = (order: Order): string => {
  const dateStr = new Date(order.createdAt).toLocaleString();
  const line = '='.repeat(52);
  const subline = '-'.repeat(52);

  const itemsText = order.items
    .map(
      (item) =>
        `${item.quantity}x ${item.name}\n   SKU: ${item.sku} | Price: $${item.price.toFixed(2)} | Total: $${(
          item.price * item.quantity
        ).toFixed(2)}`
    )
    .join('\n');

  return `
${line}
             AURA ATELIER - OFFICIAL RECEIPT
          Haute Horology & Acoustic Systems
       740 Sansome St, San Francisco, CA 94111
${line}
Order Number:    ${order.orderNumber}
Tracking Number: ${order.trackingNumber}
Order Date:      ${dateStr}
Status:          ${order.status.toUpperCase()}
Payment Method:  ${order.paymentMethod} (•••• ${order.paymentLast4})

CUSTOMER & SHIPPING:
Recipient:       ${order.shippingDetails.fullName}
Destination:     ${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.state} ${order.shippingDetails.zipCode}
Phone:           ${order.shippingDetails.phone}
Courier:         ${order.shippingMethod}
${subline}
PURCHASED PIECES:
${itemsText}
${subline}
FINANCIAL BREAKDOWN:
Subtotal:        $${order.subtotal.toFixed(2)}
${order.discount > 0 ? `Discount (${order.couponCode || 'PROMO'}): -$${order.discount.toFixed(2)}\n` : ''}Shipping Fee:    ${order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
Tax (8%):        $${order.tax.toFixed(2)}
----------------------------------------------------
GRAND TOTAL:     $${order.total.toFixed(2)} USD
====================================================
Concierge Support: concierge@aura-atelier.com
Thank you for choosing AURA Atelier.
`.trim();
};

/**
 * Copies the formatted receipt plain-text to the system clipboard
 */
export const copyReceiptToClipboard = async (order: Order): Promise<boolean> => {
  try {
    const text = generateReceiptPlainText(order);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Failed to copy receipt to clipboard:', e);
    return false;
  }
};
