import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Lock,
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Printer,
  Sparkles,
  Package,
  MapPin,
  Clock,
  Zap,
} from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';
import { OrderShippingDetails, Order } from '../../types/ecommerce';
import { printOrderReceipt } from '../../utils/receiptGenerator';
import { ReceiptModal } from '../orders/ReceiptModal';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    createOrder,
    formatPrice,
    currentUser,
    setActiveTab,
  } = useEcommerce();

  const [step, setStep] = useState<'shipping' | 'delivery' | 'payment' | 'confirmation'>('shipping');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Form states
  const [shippingDetails, setShippingDetails] = useState<OrderShippingDetails>(() => {
    if (currentUser?.savedAddresses && currentUser.savedAddresses.length > 0) {
      return currentUser.savedAddresses[0];
    }
    return {
      fullName: currentUser?.name || 'Alex Mercer',
      email: currentUser?.email || 'alex.mercer@example.com',
      address: '742 Evergreen Terrace',
      apartment: 'Suite 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'United States',
      phone: '+1 (555) 234-5678',
    };
  });

  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Expedited' | 'Priority Express'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Apple Pay' | 'Google Pay' | 'PayPal'>('Credit Card');

  // Card details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('ALEX MERCER');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const shippingFee = shippingMethod === 'Priority Express' ? 25 : shippingMethod === 'Expedited' ? 15 : 0;
  const estimatedTax = Math.round((cartSubtotal - cartDiscount) * 0.08 * 100) / 100;
  const finalTotal = Math.max(0, cartSubtotal - cartDiscount + shippingFee + estimatedTax);

  const autofillDemoAddress = () => {
    setShippingDetails({
      fullName: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      address: '742 Evergreen Terrace',
      apartment: 'Suite 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'United States',
      phone: '+1 (555) 234-5678',
    });
  };

  const autofillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder(shippingDetails.fullName.toUpperCase() || 'ALEX MERCER');
    setCardExpiry('08/29');
    setCardCvv('923');
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const order = createOrder(
        shippingDetails,
        shippingMethod,
        paymentMethod,
        cardNumber.slice(-4).replace(/\s/g, '') || '4242'
      );
      setCompletedOrder(order);
      setIsProcessing(false);
      setStep('confirmation');

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#6366f1'],
        });
      } catch (e) {
        console.log('Confetti not available', e);
      }
    }, 1200);
  };

  const handlePrintReceipt = () => {
    if (completedOrder) {
      printOrderReceipt(completedOrder);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('shipping');
    setCompletedOrder(null);
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'confirmation') handleClose();
      }}
    >
      <div
        id="checkout-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col text-stone-100 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-base text-stone-100 flex items-center gap-2">
                AURA Secure Checkout
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-normal">
                  256-Bit SSL Encrypted
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                {step === 'confirmation' ? 'Order confirmed & dispatched' : 'Guaranteed safe & tokenized payment'}
              </p>
            </div>
          </div>

          <button
            id="checkout-close-btn"
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-100 p-1.5 rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step Breadcrumbs (Only when not in confirmation) */}
        {step !== 'confirmation' && (
          <div className="bg-stone-950 px-6 py-3 border-b border-stone-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <div
                className={`flex items-center gap-1.5 ${
                  step === 'shipping' ? 'text-amber-400 font-bold' : 'text-stone-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Shipping Address</span>
              </div>
              <span className="text-stone-700">/</span>
              <div
                className={`flex items-center gap-1.5 ${
                  step === 'delivery' ? 'text-amber-400 font-bold' : 'text-stone-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Delivery Speed</span>
              </div>
              <span className="text-stone-700">/</span>
              <div
                className={`flex items-center gap-1.5 ${
                  step === 'payment' ? 'text-amber-400 font-bold' : 'text-stone-400'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Payment</span>
              </div>
            </div>

            <div className="text-stone-400 font-mono text-[11px] hidden sm:block">
              Total: <strong className="text-amber-400">{formatPrice(finalTotal)}</strong>
            </div>
          </div>
        )}

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 'shipping' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold font-serif text-stone-100">
                    Shipping & Contact Destination
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Where should we dispatch your atelier package?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={autofillDemoAddress}
                  className="text-xs text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Autofill Demo Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-medium mb-1">Full Recipient Name</label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={shippingDetails.fullName}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, fullName: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Alex Mercer"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Email for Tracking & Receipt</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={shippingDetails.email}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, email: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="alex.mercer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Phone Number</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    value={shippingDetails.phone}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, phone: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="+1 (555) 234-5678"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-300 font-medium mb-1">Street Address</label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    value={shippingDetails.address}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, address: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="742 Evergreen Terrace"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Apartment / Suite / Unit</label>
                  <input
                    id="checkout-apartment"
                    type="text"
                    value={shippingDetails.apartment || ''}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, apartment: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="Suite 4B (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">City</label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    value={shippingDetails.city}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, city: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">State / Province</label>
                  <input
                    id="checkout-state"
                    type="text"
                    required
                    value={shippingDetails.state}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, state: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="CA"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Postal / Zip Code</label>
                  <input
                    id="checkout-zip"
                    type="text"
                    required
                    value={shippingDetails.zipCode}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, zipCode: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                    placeholder="94107"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  id="checkout-to-delivery-btn"
                  onClick={() => setStep('delivery')}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <span>Continue to Delivery Speed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DELIVERY METHOD */}
          {step === 'delivery' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-base font-bold font-serif text-stone-100">
                  Select Delivery Courier Speed
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  All dispatches are fully insured and packaged in recyclable luxury casing.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option 1: Standard */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    shippingMethod === 'Standard'
                      ? 'bg-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'Standard'}
                      onChange={() => setShippingMethod('Standard')}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === 'Standard'
                          ? 'border-amber-400 bg-amber-400'
                          : 'border-stone-600'
                      }`}
                    >
                      {shippingMethod === 'Standard' && (
                        <div className="w-2 h-2 rounded-full bg-stone-950" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-100 flex items-center gap-2">
                        <span>Standard Carbon-Neutral Delivery</span>
                        <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                          3–5 Business Days
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Tracked via DHL Express / UPS Ground.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-400">FREE</span>
                </label>

                {/* Option 2: Expedited */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    shippingMethod === 'Expedited'
                      ? 'bg-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'Expedited'}
                      onChange={() => setShippingMethod('Expedited')}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === 'Expedited'
                          ? 'border-amber-400 bg-amber-400'
                          : 'border-stone-600'
                      }`}
                    >
                      {shippingMethod === 'Expedited' && (
                        <div className="w-2 h-2 rounded-full bg-stone-950" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-100 flex items-center gap-2">
                        <span>Expedited 2-Day Air</span>
                        <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                          2 Business Days
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Priority queue allocation & flight dispatch.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-stone-200">
                    {formatPrice(15)}
                  </span>
                </label>

                {/* Option 3: Overnight */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    shippingMethod === 'Priority Express'
                      ? 'bg-stone-950 border-amber-400 shadow-md'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'Priority Express'}
                      onChange={() => setShippingMethod('Priority Express')}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === 'Priority Express'
                          ? 'border-amber-400 bg-amber-400'
                          : 'border-stone-600'
                      }`}
                    >
                      {shippingMethod === 'Priority Express' && (
                        <div className="w-2 h-2 rounded-full bg-stone-950" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-100 flex items-center gap-2">
                        <span>VIP Priority Overnight</span>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          Next Morning by 10:30 AM
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Hand-packed with white glove delivery tracking.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-stone-200">
                    {formatPrice(25)}
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  id="checkout-to-payment-btn"
                  onClick={() => setStep('payment')}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <span>Continue to Secure Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT SIMULATION */}
          {step === 'payment' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold font-serif text-stone-100">
                    Payment Simulation & Verification
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Select your preferred encrypted transaction method.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={autofillTestCard}
                  className="text-xs text-amber-400 hover:text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Autofill Test Visa
                </button>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'Credit Card'
                      ? 'bg-stone-950 border-amber-400 text-amber-300 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Apple Pay')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'Apple Pay'
                      ? 'bg-stone-950 border-amber-400 text-amber-300 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('PayPal')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'PayPal'
                      ? 'bg-stone-950 border-amber-400 text-amber-300 shadow'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>PayPal</span>
                </button>
              </div>

              {/* Interactive Virtual Card Preview */}
              {paymentMethod === 'Credit Card' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-stone-800 via-stone-850 to-stone-950 border border-stone-700 p-5 rounded-2xl shadow-xl text-stone-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-amber-400 tracking-widest text-sm">
                        AURA ATELIER
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-300 bg-stone-900 px-2 py-0.5 rounded border border-stone-700">
                        VISA
                      </span>
                    </div>

                    <div className="font-mono text-lg tracking-widest text-stone-100 py-1">
                      {cardNumber}
                    </div>

                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <div className="text-[9px] text-stone-400 uppercase tracking-wider">Cardholder</div>
                        <div className="font-semibold">{cardHolder}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-stone-400 uppercase tracking-wider">Expires</div>
                        <div className="font-mono font-semibold">{cardExpiry}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Input Form */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-stone-300 font-medium mb-1">Card Number</label>
                      <input
                        id="checkout-card-num"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-stone-300 font-medium mb-1">Name on Card</label>
                      <input
                        id="checkout-card-name"
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 uppercase focus:outline-none focus:border-amber-400"
                        placeholder="ALEX MERCER"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-medium mb-1">Expiry Date (MM/YY)</label>
                      <input
                        id="checkout-card-expiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                        placeholder="12/28"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-300 font-medium mb-1">CVV / CVC Code</label>
                      <input
                        id="checkout-card-cvv"
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 font-mono focus:outline-none focus:border-amber-400"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Alternate 1-Click Pay Preview */}
              {paymentMethod !== 'Credit Card' && (
                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 text-center space-y-3">
                  <Zap className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-bold text-stone-100">{paymentMethod} 1-Touch Express</h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Your authenticated {paymentMethod} account will automatically authorize the transaction securely with biometrics.
                  </p>
                </div>
              )}

              {/* Order Summary Recap */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-mono text-stone-200">{formatPrice(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedCoupon?.code || 'Promo'})</span>
                    <span className="font-mono">-{formatPrice(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-stone-200">
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-mono text-stone-200">{formatPrice(estimatedTax)}</span>
                </div>
                <div className="border-t border-stone-800 pt-2 flex justify-between text-sm font-bold text-stone-100">
                  <span>Total Amount Authorized</span>
                  <span className="font-mono text-amber-400 text-base">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('delivery')}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  id="checkout-submit-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold px-8 py-3.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Encrypting & Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authorize Payment ({formatPrice(finalTotal)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMATION & INVOICE */}
          {step === 'confirmation' && completedOrder && (
            <div id="order-invoice-receipt" className="space-y-6 max-w-2xl mx-auto text-xs">
              {/* Success Hero */}
              <div className="text-center space-y-2 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-100">
                  Payment Authorized & Order Confirmed
                </h3>
                <p className="text-stone-400 max-w-md mx-auto">
                  Thank you, <strong className="text-stone-200">{completedOrder.customerName}</strong>. A confirmation and digital invoice has been dispatched to{' '}
                  <span className="text-amber-400">{completedOrder.customerEmail}</span>.
                </p>
              </div>

              {/* Order Metadata Card */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-stone-400 text-[11px] block">Order Number</span>
                    <span className="font-mono text-base font-bold text-amber-400">
                      {completedOrder.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[11px] block">Live Tracking ID</span>
                    <span className="font-mono text-xs font-bold text-stone-200 bg-stone-900 px-2 py-1 rounded">
                      {completedOrder.trackingNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[11px] block">Estimated Delivery</span>
                    <span className="font-bold text-stone-200">
                      {completedOrder.estimatedDeliveryDate}
                    </span>
                  </div>
                </div>

                {/* Items Purchased */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-stone-300 uppercase tracking-wider text-[11px]">
                    Purchased Atelier Pieces ({completedOrder.items.length})
                  </h5>
                  {completedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 bg-stone-900 border border-stone-800/80 p-3 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-950"
                        />
                        <div>
                          <h6 className="font-bold text-stone-100">{item.name}</h6>
                          <span className="text-[11px] text-stone-400 font-mono">
                            SKU: {item.sku} • Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-stone-200">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-800 text-[11px]">
                  <div>
                    <span className="text-stone-400 block mb-1">Dispatched To:</span>
                    <div className="text-stone-200 leading-relaxed font-medium">
                      {completedOrder.shippingDetails.fullName}
                      <br />
                      {completedOrder.shippingDetails.address}
                      {completedOrder.shippingDetails.apartment && `, ${completedOrder.shippingDetails.apartment}`}
                      <br />
                      {completedOrder.shippingDetails.city}, {completedOrder.shippingDetails.state} {completedOrder.shippingDetails.zipCode}
                    </div>
                  </div>

                  <div>
                    <span className="text-stone-400 block mb-1">Payment Method:</span>
                    <div className="text-stone-200 leading-relaxed font-medium">
                      {completedOrder.paymentMethod} •••• {completedOrder.paymentLast4}
                      <br />
                      Authorized: {new Date(completedOrder.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-emerald-400 font-semibold">Payment Status: Settled</span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t border-stone-800 pt-3 space-y-1 text-stone-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-stone-200">{formatPrice(completedOrder.subtotal)}</span>
                  </div>
                  {completedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({completedOrder.couponCode})</span>
                      <span className="font-mono">-{formatPrice(completedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-mono text-stone-200">
                      {completedOrder.shippingFee === 0 ? 'FREE' : formatPrice(completedOrder.shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span className="font-mono text-stone-200">{formatPrice(completedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-100 pt-1 border-t border-stone-800">
                    <span>Grand Total Paid</span>
                    <span className="font-mono text-amber-400">{formatPrice(completedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    id="print-invoice-btn"
                    onClick={handlePrintReceipt}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-stone-700 shadow-sm"
                    title="Quick Print Invoice"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    id="open-receipt-generator-btn"
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-stone-800"
                    title="Customize template, thermal slip, or gift receipt"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Receipt Options</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    id="receipt-view-orders-btn"
                    onClick={() => {
                      handleClose();
                      setActiveTab('orders');
                    }}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>View in Orders Hub</span>
                  </button>

                  <button
                    id="receipt-continue-shopping-btn"
                    onClick={() => {
                      handleClose();
                      setActiveTab('shop');
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Generator Dialog */}
      <ReceiptModal
        order={completedOrder}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
