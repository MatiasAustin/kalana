"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "@/lib/actions/settings";
import { testBiteshipConnection } from "@/lib/actions/shipping";
import { Truck, CheckCircle2, AlertCircle, Loader2, KeyRound, MapPin, ExternalLink } from "lucide-react";

interface ShippingSettingsFormProps {
  initialSettings: any;
}

export function ShippingSettingsForm({ initialSettings }: ShippingSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    biteshipApiKey: initialSettings?.biteshipApiKey || "",
    shippingOriginPostalCode: initialSettings?.shippingOriginPostalCode || "41373",
    shippingOriginCity: initialSettings?.shippingOriginCity || "Karawang",
    shippingOriginProvince: initialSettings?.shippingOriginProvince || "Jawa Barat",
  });

  const handleTestConnection = async () => {
    if (!formData.biteshipApiKey.trim()) {
      setTestResult({ success: false, message: "Masukkan API Key terlebih dahulu." });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testBiteshipConnection(formData.biteshipApiKey);
      if (res.success) {
        setTestResult({
          success: true,
          message: `Koneksi Biteship Berhasil! ${res.courierCount} opsi layanan ekspedisi aktif siap digunakan.`,
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || "Gagal menghubungi Biteship API.",
        });
      }
    } catch {
      setTestResult({ success: false, message: "Terjadi kesalahan saat menguji koneksi." });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateSiteSettings({
        biteshipApiKey: formData.biteshipApiKey.trim(),
        shippingOriginPostalCode: formData.shippingOriginPostalCode.trim(),
        shippingOriginCity: formData.shippingOriginCity.trim(),
        shippingOriginProvince: formData.shippingOriginProvince.trim(),
      });

      if (res.success) {
        alert("Pengaturan pengiriman berhasil disimpan!");
        router.refresh();
      } else {
        alert(res.error || "Gagal menyimpan pengaturan.");
      }
    } catch {
      alert("Terjadi kendala saat menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Biteship API Integration Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 font-mono">Biteship Logistics API</h2>
              <p className="text-xs text-gray-500 font-sans">
                Agregator tarif real-time kurir ekspedisi di Indonesia (JNE, J&T, SiCepat, Anteraja, POS).
              </p>
            </div>
          </div>
          <a
            href="https://dashboard.biteship.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans"
          >
            Dashboard Biteship <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 font-mono uppercase tracking-wider">
            Biteship API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.biteshipApiKey}
                onChange={(e) => setFormData({ ...formData, biteshipApiKey: e.target.value })}
                placeholder="biteship_live.xxx atau biteship_test.xxx"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !formData.biteshipApiKey.trim()}
              className="px-4 py-2 border border-black text-xs font-mono font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Test Koneksi"}
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded text-xs flex items-center gap-2 font-mono ${
                testResult.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1 font-sans">
            <span className="font-bold font-mono text-[11px] uppercase block text-amber-950">
              💡 Catatan Saldo Biteship Live:
            </span>
            <p className="leading-relaxed text-[11px]">
              Jika saldo akun Biteship Live Anda belum di-topup, sistem KALANA secara otomatis mengaktifkan <strong>Smart Tariff Matrix</strong> berdasarkan zona kota & bobot pesanan riil. Dengan demikian, checkout pelanggan tetap berjalan mulus tanpa kendala.
            </p>
          </div>
        </div>
      </div>

      {/* Roastery Origin Address */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2.5 bg-gray-100 text-gray-700 rounded-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-mono">Titik Asal Pengiriman (Roastery Origin)</h2>
            <p className="text-xs text-gray-500 font-sans">
              Lokasi asal roastery untuk menghitung jarak & ongkir ke alamat pelanggan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1 uppercase tracking-wider">
              Kota / Kabupaten
            </label>
            <input
              type="text"
              required
              value={formData.shippingOriginCity}
              onChange={(e) => setFormData({ ...formData, shippingOriginCity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black font-sans text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1 uppercase tracking-wider">
              Provinsi
            </label>
            <input
              type="text"
              required
              value={formData.shippingOriginProvince}
              onChange={(e) => setFormData({ ...formData, shippingOriginProvince: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black font-sans text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1 uppercase tracking-wider">
              Kode Pos Asal
            </label>
            <input
              type="text"
              required
              value={formData.shippingOriginPostalCode}
              onChange={(e) => setFormData({ ...formData, shippingOriginPostalCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-black text-white rounded text-xs font-mono font-semibold uppercase tracking-wider hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Simpan Pengaturan Pengiriman</span>
        </button>
      </div>
    </form>
  );
}
