"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updatePaymentSettings } from "@/lib/actions/settings";

export function PaymentSettingsForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [formData, setFormData] = useState({
    activePaymentGateway: initialData.activePaymentGateway,
    mayarApiKey: initialData.mayarApiKey,
    dokuClientId: initialData.dokuClientId,
    dokuSecretKey: initialData.dokuSecretKey,
  });

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
            <option value="NONE">None (Manual/COD)</option>
            <option value="MAYAR">Mayar</option>
            <option value="DOKU">DOKU</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">Select which payment gateway is actively used for checkout.</p>
        </div>
      </div>

      {formData.activePaymentGateway === 'MAYAR' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3">Mayar Credentials</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input 
              type="password"
              value={formData.mayarApiKey}
              onChange={(e) => setFormData({...formData, mayarApiKey: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="sk_live_..."
            />
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
