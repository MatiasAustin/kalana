"use client";

import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="w-full bg-kalana-offwhite text-kalana-black min-h-[80vh] flex flex-col items-center justify-center pt-32 px-6 text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-8">Status: Empty</p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase mb-12">Your Cart<br/>Is Empty.</h1>
        <Link 
          href="/roastery" 
          className="text-[10px] font-semibold tracking-[0.2em] uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity"
        >
          Explore Roastery →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-kalana-offwhite text-kalana-black pt-32 pb-24 min-h-screen relative overflow-hidden">
      
      <div className="absolute top-1/2 left-6 -translate-y-1/2 vertical-text text-[10px] tracking-[0.2em] uppercase text-kalana-black/30 hidden lg:block rotate-180">
        Cart / {items.length} Items
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end border-b border-kalana-black/20 pb-8 mb-24">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter uppercase leading-none">Your Cart.</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">
            {items.length} Items
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-8 space-y-12">
            {items.map((item, idx) => (
              <div key={`${item.id}-${item.variant}`} className="flex flex-col sm:flex-row gap-8 border-b border-kalana-black/10 pb-12 relative">
                <span className="absolute -top-6 text-[10px] tracking-[0.2em] text-kalana-black/30 uppercase">Item 0{idx+1}</span>
                
                <div className="w-32 h-40 bg-kalana-black/5 relative flex-shrink-0 border border-kalana-black/10">
                   {item.image ? (
                     <Image src={item.image} alt={item.name} fill className="object-cover grayscale mix-blend-multiply" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-[10px] tracking-[0.2em] uppercase text-kalana-black/30">IMG</div>
                   )}
                </div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-1">{item.collection}</p>
                        <h3 className="text-2xl font-semibold uppercase tracking-tight">{item.name}</h3>
                      </div>
                      <button onClick={() => removeItem(item.id, item.variant)} className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/40 hover:text-kalana-black transition-colors border-b border-transparent hover:border-kalana-black pb-0.5">
                        Remove
                      </button>
                    </div>
                    
                    <p className="text-xs tracking-wider uppercase text-kalana-black/70 mb-8">{item.variant}</p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-kalana-black/20">
                      <button onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)} className="p-3 hover:bg-kalana-black/5 transition-colors">
                        <Minus className="w-3 h-3" strokeWidth={1} />
                      </button>
                      <span className="w-8 text-center text-[10px] font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)} className="p-3 hover:bg-kalana-black/5 transition-colors">
                        <Plus className="w-3 h-3" strokeWidth={1} />
                      </button>
                    </div>
                    <p className="text-lg font-medium">IDR {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="border border-kalana-black/20 p-8 lg:p-12 sticky top-32">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-12 text-kalana-black/50 border-b border-kalana-black/20 pb-4">Order Summary</h2>
              
              <div className="space-y-6 mb-12 text-xs tracking-wider uppercase">
                <div className="flex justify-between">
                  <span className="text-kalana-black/60">Subtotal</span>
                  <span className="font-medium text-kalana-black">IDR {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-kalana-black/60">Shipping</span>
                  <span className="font-medium text-kalana-black">At Checkout</span>
                </div>
              </div>
              
              <div className="pt-8 border-t border-kalana-black/20 mb-12">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">Total</span>
                  <span className="text-2xl font-medium tracking-tight">IDR {subtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <Link 
                href="/checkout"
                className="block w-full py-5 bg-kalana-black text-kalana-offwhite text-center text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
