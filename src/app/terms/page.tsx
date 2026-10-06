import { getPageContent } from "@/lib/cms-api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TermsPage() {
  const page = await getPageContent("terms");

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-kalana-black/50 hover:text-kalana-black mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        
        <div className="border-b border-kalana-black/20 pb-8 mb-12">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter uppercase mb-3">
            {page.title || "Terms & Conditions"}
          </h1>
          <p className="text-xs text-kalana-black/50 tracking-wider uppercase font-mono">
            {page.subtitle || "Last updated: 2026"}
          </p>
        </div>

        <div className="prose prose-neutral max-w-none text-sm md:text-base font-light leading-relaxed whitespace-pre-line text-kalana-black/80">
          {page.content}
        </div>
      </div>
    </div>
  );
}
