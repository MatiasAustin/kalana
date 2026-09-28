"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function CheckoutPage() {
  const { items } = useCartStore();
  const { isSignedIn, isLoaded } = useAuth();
  const [guestMode, setGuestMode] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 20000;
  const total = subtotal + shipping;

  if (!isLoaded) {
    return <div className="min-h-screen bg-kalana-offwhite flex items-center justify-center font-mono text-sm tracking-widest uppercase">Loading checkout...</div>;
  }

  if (!isSignedIn && !guestMode) {
    return (
      <div className="min-h-screen bg-kalana-offwhite flex flex-col items-center justify-center p-4">
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-bold tracking-widest uppercase font-mono">Sign in to continue</h1>
          <p className="text-sm text-kalana-black/60 mt-2 font-mono">Save your details for faster checkout</p>
        </div>
        <div className="space-y-4 w-full max-w-xs flex flex-col">
          <Link href="/login" className="px-6 py-4 bg-kalana-black text-kalana-offwhite text-center font-mono text-xs tracking-widest hover:bg-black/80 transition-colors">SIGN IN</Link>
          <Link href="/signup" className="px-6 py-4 border border-kalana-black text-kalana-black text-center font-mono text-xs tracking-widest hover:bg-kalana-black/5 transition-colors">CREATE ACCOUNT</Link>
          <button onClick={() => setGuestMode(true)} className="mt-8 px-6 py-4 text-kalana-black/60 text-center font-mono text-xs tracking-widest hover:text-kalana-black transition-colors underline underline-offset-4">CONTINUE AS GUEST</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kalana-offwhite text-kalana-black flex flex-col md:flex-row pt-20">
      
      {/* Left Form Section */}
      <div className="w-full md:w-3/5 p-6 lg:p-16 lg:pr-24 overflow-y-auto order-2 md:order-1">
        <div className="max-w-2xl ml-auto">
          
          <Link href="/" className="inline-block text-2xl font-semibold tracking-tighter uppercase mb-8 hover:opacity-50 transition-opacity">
            kalana.
          </Link>
          
          <div className="flex items-center text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-16 border-b border-kalana-black/20 pb-4">
            <Link href="/cart" className="hover:text-kalana-black transition-colors">Cart</Link>
            <span className="mx-2">/</span>
            <span className="text-kalana-black font-semibold">Shipping</span>
            <span className="mx-2">/</span>
            <span>Payment</span>
          </div>

          <form className="space-y-16">
            {/* Contact */}
            <section>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 text-kalana-black/50">Contact</h2>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 text-kalana-black/50">Shipping Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Address" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
                <input 
                  type="text" 
                  placeholder="Apartment, suite, etc. (optional)" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
                <div className="grid grid-cols-2 gap-8">
                  <input 
                    type="text" 
                    placeholder="City" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                  <input 
                    type="text" 
                    placeholder="Postal Code" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                </div>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
              </div>
            </section>

            <div className="flex justify-between items-center pt-8">
              <Link href="/cart" className="text-[10px] text-kalana-black/50 hover:text-kalana-black transition-colors tracking-[0.2em] uppercase border-b border-transparent hover:border-kalana-black pb-1">
                Return to cart
              </Link>
              <button type="button" className="px-12 py-5 bg-kalana-black text-kalana-offwhite text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors">
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Summary Section */}
      <div className="w-full md:w-2/5 bg-kalana-black/5 border-l border-kalana-black/20 p-6 lg:p-16 order-1 md:order-2">
        <div className="max-w-md mr-auto">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-12 text-kalana-black border-b border-kalana-black/20 pb-4">Order Summary</h2>
          
          <div className="space-y-8 mb-12 max-h-[50vh] overflow-y-auto pr-4 no-scrollbar">
            {items.map((item) => (
              <div key={`${item.id}-${item.variant}`} className="flex justify-between items-start">
                <div className="flex gap-6">
                  <div className="relative w-16 h-20 bg-kalana-black/10 border border-kalana-black/10">
                    <span className="absolute -top-2 -right-2 bg-kalana-black text-kalana-offwhite text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-1">{item.name}</h4>
                    <p className="text-[10px] text-kalana-black/50 uppercase tracking-[0.2em]">{item.variant}</p>
                  </div>
                </div>
                <p className="text-sm font-medium pt-2">IDR {(item.price * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-y border-kalana-black/20 py-8 mb-8 text-[10px] tracking-[0.2em] uppercase text-kalana-black/70">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-sm font-medium tracking-wide text-kalana-black">IDR {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span className="text-sm font-medium tracking-wide text-kalana-black">IDR {shipping.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold uppercase tracking-widest">Total</span>
            <span className="text-2xl font-medium tracking-tight">IDR {total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
