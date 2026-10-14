"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Package, ArrowRight, Truck, Compass, ShieldCheck } from "lucide-react";

export default function TrackingSearchPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderNumber.trim();
    if (!clean) {
      setError("Masukkan nomor pesanan Anda (contoh: KAL-123456)");
      return;
    }
    router.push(`/tracking/${clean.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-kalana-offwhite text-kalana-black pt-36 pb-24 px-6 lg:px-12">
      <div className="max-w-xl mx-auto space-y-12">
        
        {/* Header Branding */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block text-3xl font-semibold tracking-tighter uppercase hover:opacity-60 transition-opacity font-mono">
            kalana.
          </Link>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-kalana-black text-white mx-auto shadow-md">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight uppercase">
            Lacak Pengiriman Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-kalana-black/60 max-w-md mx-auto leading-relaxed">
            Pantau pergerakan pesanan kopi dan merchandise KALANA Anda secara langsung melalui radar peta interaktif.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white border border-kalana-black/20 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 font-mono">
                Nomor Pesanan (Order Number)
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value);
                    setError("");
                  }}
                  placeholder="Contoh: KAL-839201"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none font-mono text-sm uppercase placeholder:normal-case"
                />
              </div>
              {error && <p className="text-xs text-red-600 mt-1 font-mono">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-black text-white hover:bg-gray-800 rounded-lg font-semibold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 font-mono shadow-md"
            >
              Lacak Pengiriman Sekarang <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-mono">
            <span>Sudah memiliki akun?</span>
            <Link href="/account/orders" className="text-black font-semibold hover:underline">
              Buka Riwayat Pesanan &rarr;
            </Link>
          </div>
        </div>

        {/* Features Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-center">
          <div className="p-4 bg-white/70 border border-kalana-black/10 rounded-xl space-y-1">
            <Compass className="w-4 h-4 text-kalana-black mx-auto mb-1" />
            <span className="font-bold block">Live Route Map</span>
            <span className="text-[10px] text-gray-500">Peta rute dari Roastery</span>
          </div>
          <div className="p-4 bg-white/70 border border-kalana-black/10 rounded-xl space-y-1">
            <Truck className="w-4 h-4 text-kalana-black mx-auto mb-1" />
            <span className="font-bold block">Multi Ekspedisi</span>
            <span className="text-[10px] text-gray-500">JNE, J&T, SiCepat, dll</span>
          </div>
          <div className="p-4 bg-white/70 border border-kalana-black/10 rounded-xl space-y-1">
            <ShieldCheck className="w-4 h-4 text-kalana-black mx-auto mb-1" />
            <span className="font-bold block">Resi Resmi</span>
            <span className="text-[10px] text-gray-500">Cek langsung di web kurir</span>
          </div>
        </div>

      </div>
    </div>
  );
}
