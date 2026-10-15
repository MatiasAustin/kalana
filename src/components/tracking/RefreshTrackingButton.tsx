"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";
import { refreshShipmentTracking } from "@/lib/actions/orders";

interface RefreshTrackingButtonProps {
  orderNumber: string;
}

export function RefreshTrackingButton({ orderNumber }: RefreshTrackingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRefresh = async () => {
    if (loading) return;
    setLoading(true);
    setSuccess(false);

    try {
      await refreshShipmentTracking(orderNumber);
      router.refresh();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-kalana-black/15 bg-white hover:bg-gray-50 text-[11px] font-mono font-medium text-kalana-black transition-colors shadow-2xs disabled:opacity-60"
      title="Perbarui status pelacakan secara realtime dari Biteship"
    >
      {loading ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-500" />
          <span>Memperbarui...</span>
        </>
      ) : success ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-semibold">Telah Diperbarui</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>Perbarui Data</span>
        </>
      )}
    </button>
  );
}
