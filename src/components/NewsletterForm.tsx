"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/actions/marketing";
import { Loader2, Check } from "lucide-react";

interface NewsletterFormProps {
  placeholder?: string;
  ctaLabel?: string;
}

export function NewsletterForm({
  placeholder = "EMAIL ADDRESS",
  ctaLabel = "Join →",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await subscribeNewsletter(email, "Homepage Newsletter");
      if (res.success) {
        setIsSubmitted(true);
        setEmail("");
      } else {
        setErrorMessage(res.message || "Failed to join newsletter.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to subscribe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-kalana-black border-b border-kalana-black/30 pb-2">
        <Check className="w-4 h-4 text-kalana-black" />
        <span>Welcome to the KALANA ritual.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md">
      <div className="flex w-full border-b border-kalana-black pb-2 items-center">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs tracking-widest text-kalana-black placeholder:text-kalana-black/30 focus:outline-none uppercase"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-[10px] font-semibold tracking-[0.2em] uppercase hover:opacity-50 transition-opacity pl-4 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : ctaLabel}
        </button>
      </div>
      {errorMessage && (
        <span className="text-[10px] text-red-600 font-mono tracking-wider mt-2">
          {errorMessage}
        </span>
      )}
    </form>
  );
}
