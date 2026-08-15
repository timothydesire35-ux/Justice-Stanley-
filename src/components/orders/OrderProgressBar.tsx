import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { OrderStatus } from '../../types/ecommerce';

interface OrderProgressBarProps {
  status: OrderStatus;
  size?: 'compact' | 'full';
  showLabels?: boolean;
  className?: string;
  isSimulating?: boolean;
}

export const STAGES: { id: OrderStatus; label: string; subLabel: string; step: number }[] = [
  { id: 'Pending', label: 'Order Placed', subLabel: 'Payment settled', step: 1 },
  { id: 'Processing', label: 'Processing', subLabel: 'Vault verification & packing', step: 2 },
  { id: 'Shipped', label: 'Shipped', subLabel: 'Courier in active transit', step: 3 },
  { id: 'Delivered', label: 'Delivered', subLabel: 'Handed to recipient', step: 4 },
];

export const getStatusProgress = (status: OrderStatus): number => {
  switch (status) {
    case 'Pending':
      return 15;
    case 'Processing':
      return 45;
    case 'Shipped':
      return 75;
    case 'Delivered':
      return 100;
    case 'Cancelled':
      return 0;
    default:
      return 25;
  }
};

export const getStageIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Processing':
      return 1;
    case 'Shipped':
      return 2;
    case 'Delivered':
      return 3;
    case 'Cancelled':
      return -1;
    default:
      return 0;
  }
};

export const OrderProgressBar: React.FC<OrderProgressBarProps> = ({
  status,
  size = 'full',
  showLabels = true,
  className = '',
  isSimulating = false,
}) => {
  const currentStageIdx = getStageIndex(status);
  const progressPercent = getStatusProgress(status);

  if (status === 'Cancelled') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-xs text-rose-400">
          <span className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Order Cancelled</span>
          </span>
          <span className="text-[11px] text-stone-400">Refund Processed</span>
        </div>
        <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
          <div className="bg-rose-500 h-full w-full rounded-full" />
        </div>
      </div>
    );
  }

  // Compact version for order list cards
  if (size === 'compact') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'Delivered'
                  ? 'bg-emerald-400'
                  : status === 'Shipped'
                  ? 'bg-sky-400 animate-pulse'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-semibold text-stone-200">
              {status === 'Pending' ? 'Placed' : status}
            </span>
            {isSimulating && (
              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 px-1 rounded border border-amber-800/40">
                LIVE
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-stone-400">{progressPercent}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-stone-800/90 rounded-full h-1.5 overflow-hidden p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              status === 'Delivered'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : status === 'Shipped'
                ? 'bg-gradient-to-r from-amber-500 via-sky-400 to-sky-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  // Full rich multi-node visual progress bar for detailed view
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Track & Step Nodes */}
      <div className="relative pt-2 pb-1">
        {/* Background Track Line */}
        <div className="absolute top-5 left-6 right-6 h-1.5 bg-stone-800 rounded-full -translate-y-1/2 z-0" />

        {/* Animated Active Progress Line */}
        <div
          className={`absolute top-5 left-6 h-1.5 rounded-full -translate-y-1/2 z-0 transition-all duration-700 ease-out ${
            status === 'Delivered'
              ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : status === 'Shipped'
              ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
              : 'bg-gradient-to-r from-emerald-500 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
          }`}
          style={{
            width: `calc(${progressPercent}% - 3rem * ${(100 - progressPercent) / 100})`,
            maxWidth: 'calc(100% - 3rem)',
          }}
        />

        {/* Step Nodes Grid */}
        <div className="relative z-10 grid grid-cols-4 gap-2">
          {STAGES.map((st, idx) => {
            const isCompleted = currentStageIdx > idx || status === 'Delivered';
            const isCurrent = currentStageIdx === idx && status !== 'Delivered';
            const isPending = currentStageIdx < idx && status !== 'Delivered';

            return (
              <div key={st.id} className="flex flex-col items-center text-center group">
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 relative ${
                    isCompleted
                      ? 'bg-emerald-500 text-stone-950 ring-4 ring-emerald-500/20 shadow-md scale-100'
                      : isCurrent
                      ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110'
                      : 'bg-stone-850 text-stone-500 border border-stone-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    st.id === 'Processing' ? (
                      <Package className="w-4 h-4 animate-bounce text-stone-950" />
                    ) : st.id === 'Shipped' ? (
                      <Truck className="w-4 h-4 animate-pulse text-stone-950" />
                    ) : (
                      <Clock className="w-4 h-4 text-stone-950" />
                    )
                  ) : (
                    <span className="font-mono text-xs">{st.step}</span>
                  )}

                  {/* Pulsing Radar Aura on Current Active Stage */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-25 pointer-events-none" />
                  )}
                </div>

                {/* Node Labels */}
                {showLabels && (
                  <div className="mt-2.5 space-y-0.5">
                    <div
                      className={`text-xs font-bold transition-colors ${
                        isCompleted
                          ? 'text-stone-200'
                          : isCurrent
                          ? 'text-amber-300 font-extrabold'
                          : 'text-stone-500'
                      }`}
                    >
                      {st.label}
                    </div>
                    <div className="text-[10px] text-stone-400 leading-tight hidden sm:block max-w-[110px]">
                      {st.subLabel}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
