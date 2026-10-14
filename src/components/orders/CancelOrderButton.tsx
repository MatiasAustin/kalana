"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrderCustomer } from "@/lib/actions/orders";
import { Loader2, AlertTriangle, X } from "lucide-react";

interface CancelOrderButtonProps {
  orderNumber: string;
  variant?: "button" | "outline" | "link";
  className?: string;
}

export function CancelOrderButton({
  orderNumber,
  variant = "button",
  className = "",
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setError(null);
    try {
      const res = await cancelOrderCustomer(orderNumber);
      if (res.success) {
        setShowModal(false);
        router.refresh();
      } else {
        setError(res.error || "Gagal membatalkan pesanan.");
      }
    } catch {
      setError("Terjadi kendala saat membatalkan pesanan. Silakan coba kembali.");
    } finally {
      setIsCancelling(false);
    }
  };

  const getButtonStyles = () => {
    if (variant === "outline") {
      return "border border-red-300 text-red-700 hover:bg-red-50 px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm transition-colors";
    }
    if (variant === "link") {
      return "text-[11px] text-red-600 hover:text-red-800 hover:underline transition-colors uppercase tracking-wider font-mono";
    }
    return "px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-semibold uppercase tracking-wider transition-colors";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setShowModal(true);
        }}
        className={`${getButtonStyles()} ${className}`}
      >
        Batalkan Pesanan
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans text-stone-900">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 font-mono">
                    Batalkan Pesanan?
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Order #{orderNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isCancelling && setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin membatalkan pesanan ini? Jika pesanan belum dibayar atau masih dalam antrean sangrai, pesanan akan langsung ditutup dan tidak akan ditagihkan.
            </p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs leading-relaxed">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 font-mono text-xs">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Ya, Batalkan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
