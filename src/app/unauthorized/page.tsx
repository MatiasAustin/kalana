"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Loader2, KeyRound } from 'lucide-react';

export default function UnauthorizedPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaimAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/update-admin');
      const data = await res.json();
      if (data.success) {
        window.location.href = '/admin';
      } else {
        setError(data.message || data.error || 'Failed to grant admin access.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kalana-offwhite flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 border border-kalana-black/10 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 text-red-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase font-mono">Access Restricted</h1>
        <p className="text-sm text-kalana-black/60 mb-6">
          Akun Anda saat ini belum memiliki hak akses peran <strong>ADMIN</strong> di database KALANA.
        </p>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded mb-4 text-left">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={handleClaimAdmin}
            disabled={loading}
            className="w-full bg-black text-white px-6 py-3 font-mono text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Jadikan Akun Ini ADMIN
          </button>

          <Link 
            href="/" 
            className="inline-block w-full border border-gray-300 text-gray-700 px-6 py-2.5 font-mono text-xs tracking-widest hover:bg-gray-50 transition-colors"
          >
            KEMBALI KE STORE
          </Link>
        </div>
      </div>
    </div>
  );
}
