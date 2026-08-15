import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Receipt,
  Gift,
  PackageCheck,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Eye,
  Sliders,
} from 'lucide-react';
import { Order } from '../../types/ecommerce';
import {
  ReceiptTemplate,
  ReceiptOptions,
  generateReceiptHTML,
  printOrderReceipt,
  downloadReceiptHTML,
  copyReceiptToClipboard,
} from '../../utils/receiptGenerator';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const [template, setTemplate] = useState<ReceiptTemplate>('formal_invoice');
  const [showPrices, setShowPrices] = useState<boolean>(true);
  const [includeWarrantySeal, setIncludeWarrantySeal] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const receiptOptions: ReceiptOptions = useMemo(() => {
    return {
      template,
      showPrices: template === 'gift_receipt' ? false : showPrices,
      includeWarrantySeal,
    };
  }, [template, showPrices, includeWarrantySeal]);

  // Generate live preview HTML string
  const previewHTML = useMemo(() => {
    if (!order) return '';
    return generateReceiptHTML(order, receiptOptions);
  }, [order, receiptOptions]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    printOrderReceipt(order, receiptOptions);
    setTimeout(() => setIsPrinting(false), 800);
  };

  const handleDownload = () => {
    downloadReceiptHTML(order, receiptOptions);
  };

  const handleCopy = async () => {
    const success = await copyReceiptToClipboard(order);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="receipt-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col text-stone-100 shadow-2xl overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-serif text-base text-stone-100">
                  Print Receipt & Invoice Generator
                </h3>
                <span className="text-[10px] font-mono bg-stone-900 border border-stone-700 text-amber-400 px-2 py-0.5 rounded-full">
                  #{order.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                High-fidelity, printable PDF/A4 tax invoices, 80mm thermal slips, and gift receipts.
              </p>
            </div>
          </div>

          <button
            id="receipt-modal-close-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 p-2 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Controls & Live Document Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Template & Print Settings (4 cols) */}
          <div className="lg:col-span-4 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-stone-800 space-y-6 bg-stone-950/40">
            {/* Format Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Receipt Format</span>
              </label>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  {
                    id: 'formal_invoice' as ReceiptTemplate,
                    label: 'Official Tax Invoice',
                    desc: 'Full-page Letter/A4 layout with VAT, breakdown, and seal',
                    icon: FileText,
                  },
                  {
                    id: 'thermal_pos' as ReceiptTemplate,
                    label: '80mm Thermal POS Slip',
                    desc: 'Compact slip for point-of-sale receipt printers',
                    icon: Receipt,
                  },
                  {
                    id: 'gift_receipt' as ReceiptTemplate,
                    label: 'Gift Exchange Receipt',
                    desc: 'Prices masked with 45-day warranty exchange pass',
                    icon: Gift,
                  },
                  {
                    id: 'packing_slip' as ReceiptTemplate,
                    label: 'Warehouse Packing Slip',
                    desc: 'Dispatch checklist with routing barcodes',
                    icon: PackageCheck,
                  },
                ].map((tpl) => {
                  const Icon = tpl.icon;
                  const isSelected = template === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      id={`receipt-format-${tpl.id}`}
                      type="button"
                      onClick={() => setTemplate(tpl.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-stone-100 shadow-md ring-1 ring-amber-400/30'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 font-bold'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-200">{tpl.label}</div>
                        <div className="text-[11px] text-stone-400 leading-tight mt-0.5">
                          {tpl.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-3 pt-4 border-t border-stone-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Document Options</span>
              </label>

              <div className="space-y-2.5 text-xs text-stone-300">
                {template !== 'gift_receipt' && (
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/70 border border-stone-800 cursor-pointer hover:bg-stone-900 transition-colors">
                    <span>Include Pricing & Taxes</span>
                    <input
                      type="checkbox"
                      checked={showPrices}
                      onChange={(e) => setShowPrices(e.target.checked)}
                      className="rounded bg-stone-950 border-stone-700 text-amber-400 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>
                )}

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/70 border border-stone-800 cursor-pointer hover:bg-stone-900 transition-colors">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Atelier Authenticity Seal</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={includeWarrantySeal}
                    onChange={(e) => setIncludeWarrantySeal(e.target.checked)}
                    className="rounded bg-stone-950 border-stone-700 text-amber-400 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Print Output Actions */}
            <div className="space-y-2.5 pt-4 border-t border-stone-800/80">
              {/* Primary Print Button */}
              <button
                id="receipt-dialog-print-btn"
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>{isPrinting ? 'Opening Print Dialog...' : 'Print Receipt Now'}</span>
              </button>

              {/* Secondary Download HTML & Copy Text */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="receipt-dialog-download-btn"
                  type="button"
                  onClick={handleDownload}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Download standalone HTML document"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download HTML</span>
                </button>

                <button
                  id="receipt-dialog-copy-btn"
                  type="button"
                  onClick={handleCopy}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Copy formatted plain text receipt"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Iframe Preview (8 cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col bg-stone-950 items-center justify-start">
            <div className="w-full flex items-center justify-between mb-3 text-xs text-stone-400 px-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                Live Print Layout Preview
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                Format: {template.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            {/* Embedded Iframe Preview Box */}
            <div className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-800 h-[480px] sm:h-[540px] relative">
              <iframe
                title="Receipt Live Preview"
                srcDoc={previewHTML}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
