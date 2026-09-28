import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-kalana-offwhite flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 border border-kalana-black/10 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 text-red-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase font-mono">Access Restricted</h1>
        <p className="text-kalana-black/60 mb-8">
          You don't have permission to access the KALANA admin dashboard.
        </p>
        <Link 
          href="/" 
          className="inline-block w-full bg-kalana-black text-kalana-offwhite px-6 py-3 font-mono text-sm tracking-widest hover:bg-black/80 transition-colors"
        >
          BACK TO KALANA
        </Link>
      </div>
    </div>
  );
}
