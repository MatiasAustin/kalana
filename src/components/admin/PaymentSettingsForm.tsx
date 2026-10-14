"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updatePaymentSettings } from "@/lib/actions/settings";

export function PaymentSettingsForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState({
    activePaymentGateway: initialData.activePaymentGateway || "MAYAR",
    mayarApiKey: initialData.mayarApiKey || "",
    mayarPaymeUrl: initialData.mayarPaymeUrl || "https://mayar.to/kalanaspaceroastery",
    mayarCustomerPortalUrl: initialData.mayarCustomerPortalUrl || "https://kalanaspaceroastery.myr.id/portal",
    dokuClientId: initialData.dokuClientId || "",
    dokuSecretKey: initialData.dokuSecretKey || "",
  });

  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = await updatePaymentSettings(formData);
    
    if (res.success) {
      setMessage({ type: 'success', text: 'Payment settings saved successfully.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save settings.' });
    }
    
    setIsSubmitting(false);
  };

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/webhooks/mayar` 
    : "https://your-domain.com/api/webhooks/mayar";

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`px-4 py-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Active Payment Gateway</label>
          <select
            value={formData.activePaymentGateway}
            onChange={(e) => setFormData({...formData, activePaymentGateway: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white"
          >
            <option value="MAYAR">Mayar (PayMe & Gateway)</option>
            <option value="DOKU">DOKU</option>
            <option value="NONE">None (Manual / COD)</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">Pilih payment gateway aktif yang digunakan saat pelanggan melakukan checkout.</p>
        </div>
      </div>

      {formData.activePaymentGateway === 'MAYAR' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Konfigurasi Mayar</h2>
              <p className="text-xs text-gray-500 mt-0.5">Integrasi PayMe Link, Portal Pelanggan, dan API Mayar untuk KALANA Space & Roastery.</p>
            </div>
            <span className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-800 text-[11px] font-semibold rounded-full uppercase tracking-wider">
              Ready / Active
            </span>
          </div>

          {/* PayMe Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">PayMe Link</label>
              {formData.mayarPaymeUrl && (
                <a 
                  href={formData.mayarPaymeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Buka Link PayMe ↗
                </a>
              )}
            </div>
            <input 
              type="url"
              value={formData.mayarPaymeUrl}
              onChange={(e) => setFormData({...formData, mayarPaymeUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black font-mono text-xs"
              placeholder="https://mayar.to/kalanaspaceroastery"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Link pembayaran instan Mayar. Pelanggan checkout dapat langsung dialihkan ke PayMe ini untuk pembayaran via QRIS, Virtual Account, E-Wallet, Kartu Kredit, atau Gerai Retail.
            </p>
          </div>

          {/* Portal Pelanggan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Portal Pelanggan (Customer Portal)</label>
              {formData.mayarCustomerPortalUrl && (
                <a 
                  href={formData.mayarCustomerPortalUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Buka Portal Pelanggan ↗
                </a>
              )}
            </div>
            <input 
              type="url"
              value={formData.mayarCustomerPortalUrl}
              onChange={(e) => setFormData({...formData, mayarCustomerPortalUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black font-mono text-xs"
              placeholder="https://kalanaspaceroastery.myr.id/portal"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Tautan portal mandiri Mayar bagi pelanggan untuk melacak riwayat pembayaran, mengunduh bukti kwitansi resmi, dan mengecek invoice. Ditampilkan di halaman akun/pesanan pelanggan.
            </p>
          </div>

          {/* API Key (Optional) */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mayar API Key (Opsional untuk Generate Invoice Otomatis)</label>
            <input 
              type="password"
              value={formData.mayarApiKey}
              onChange={(e) => setFormData({...formData, mayarApiKey: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black font-mono text-xs"
              placeholder="sk_live_... (opsional, jika kosong sistem otomatis pakai PayMe Link di atas)"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Jika diisi, sistem akan otomatis membuat invoice dinamis di Mayar dengan nominal belanja presisi. Jika dikosongkan, checkout otomatis diarahkan ke PayMe Link.
            </p>
          </div>

          {/* Webhook Endpoint Info */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">Webhook URL KALANA</span>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="text-xs bg-black text-white px-2.5 py-1 rounded hover:bg-gray-800 transition-colors"
              >
                {copiedWebhook ? "Tersalin!" : "Salin URL"}
              </button>
            </div>
            <p className="text-xs text-gray-600 font-mono break-all bg-white p-2 border border-gray-200 rounded">
              {webhookUrl}
            </p>
            <p className="text-[11px] text-gray-500">
              Salin URL ini dan tempel di <strong>Dashboard Mayar &rarr; Integrasi &rarr; Webhook</strong> agar pesanan otomatis berubah menjadi <strong>PAID</strong> saat pembayaran selesai diterima.
            </p>
          </div>
        </div>
      )}

      {formData.activePaymentGateway === 'DOKU' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3">DOKU Credentials</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
            <input 
              type="text"
              value={formData.dokuClientId}
              onChange={(e) => setFormData({...formData, dokuClientId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input 
              type="password"
              value={formData.dokuSecretKey}
              onChange={(e) => setFormData({...formData, dokuSecretKey: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-70 flex items-center"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Payment Settings
        </button>
      </div>
    </form>
  );
}
