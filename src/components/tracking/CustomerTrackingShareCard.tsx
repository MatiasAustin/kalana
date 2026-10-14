"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Copy, Check, ArrowRight, Share2, MapPin } from "lucide-react";

interface CustomerTrackingShareCardProps {
  orderNumber: string;
}

export function CustomerTrackingShareCard({ orderNumber }: CustomerTrackingShareCardProps) {
  const [copied, setCopied] = useState(false);

  const getTrackingUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/tracking/${orderNumber}`;
    }
    return `/tracking/${orderNumber}`;
  };

  const handleCopyLink = () => {
    const url = getTrackingUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = getTrackingUrl();
    const message = `Halo, ini tautan pelacakan pengiriman pesanan KALANA saya (Order #${orderNumber}):\n${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-stone-900 text-stone-100 p-6 rounded-lg space-y-5 shadow-lg border border-stone-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 block font-semibold">
              Live Map Radar
            </span>
            <h3 className="font-semibold text-base uppercase tracking-wider text-white">
              Pelacakan Pengiriman Pesanan
            </h3>
          </div>
        </div>

        <Link
          href={`/tracking/${orderNumber}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-sm transition-all whitespace-nowrap shadow-md self-start sm:self-auto font-mono"
        >
          <MapPin className="w-3.5 h-3.5" />
          Buka Live Peta <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <p className="text-xs text-stone-300 leading-relaxed font-sans">
        Pantau rute ekspedisi dan pergerakan mobil kurir KALANA dari Roastery Cikampek ke alamat Anda. Bagi Anda yang berbelanja sebagai <strong>Tamu (Guest Checkout)</strong>, simpan tautan pelacakan ini untuk memantau status pesanan kapan pun.
      </p>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded text-xs font-mono font-medium transition-colors border border-stone-700"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300 font-semibold">Tautan Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-stone-400" />
              <span>Salin Link Tracking</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200 border border-emerald-600/40 rounded text-xs font-mono font-medium transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Simpan / Kirim ke WhatsApp
        </button>
      </div>
    </div>
  );
}
