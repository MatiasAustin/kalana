"use client";

import { useCartStore } from "@/store/cartStore";
import { X, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-kalana-black/10 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-kalana-offwhite z-50 flex flex-col border-l border-kalana-black/20"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-kalana-black/20">
              <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase">Cart {totalItems > 0 && `(${totalItems})`}</h2>
              <button onClick={closeCart} className="text-kalana-black hover:opacity-50 transition-opacity">
                <X className="w-4 h-4" strokeWidth={1} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-start justify-center">
                  <div className="text-[10px] tracking-widest uppercase text-kalana-black/40 mb-4">Empty</div>
                  <h3 className="text-4xl font-medium tracking-tight leading-none mb-12">Your cart<br/>is empty.</h3>
                  <Link 
                    href="/roastery" 
                    onClick={closeCart}
                    className="text-xs font-semibold tracking-widest uppercase border-b border-kalana-black pb-1 hover:opacity-50 transition-opacity"
                  >
                    Explore Roastery →
                  </Link>
                </div>
              ) : (
                <div className="space-y-10">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variant}`} className="flex gap-6">
                      <div className="w-24 h-32 bg-kalana-black/5 relative flex-shrink-0 border border-kalana-black/10">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover grayscale mix-blend-multiply" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-kalana-black/30">IMG</div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] text-kalana-black/50 uppercase tracking-[0.2em] mb-1">{item.collection}</p>
                            <h3 className="font-medium uppercase text-sm tracking-wide">{item.name}</h3>
                          </div>
                          <button onClick={() => removeItem(item.id, item.variant)} className="text-[10px] uppercase tracking-widest text-kalana-black/40 hover:text-kalana-black border-b border-transparent hover:border-kalana-black transition-all">Remove</button>
                        </div>
                        <p className="text-[10px] text-kalana-black/70 uppercase tracking-widest mb-6">{item.variant}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border border-kalana-black/20">
                            <button onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)} className="p-2 hover:bg-kalana-black/5 transition-colors">
                              <Minus className="w-3 h-3" strokeWidth={1} />
                            </button>
                            <span className="w-6 text-center text-[10px]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)} className="p-2 hover:bg-kalana-black/5 transition-colors">
                              <Plus className="w-3 h-3" strokeWidth={1} />
                            </button>
                          </div>
                          <p className="text-xs font-medium tracking-wide">IDR {item.price.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t border-kalana-black/20 bg-kalana-offwhite">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] uppercase tracking-[0.2em]">Subtotal</span>
                  <span className="text-sm font-medium tracking-wide">IDR {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="space-y-4">
                  <Link 
                    href="/checkout" 
                    onClick={closeCart}
                    className="block w-full py-4 bg-kalana-black text-kalana-offwhite text-center text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors"
                  >
                    Checkout
                  </Link>
                  <Link 
                    href="/cart" 
                    onClick={closeCart}
                    className="block w-full py-4 bg-transparent border border-kalana-black text-kalana-black text-center text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/5 transition-colors"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
