"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/store/cartStore";
import { processCheckout } from "@/lib/actions/checkout";

export default function CheckoutPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    phone: "",
    country: "Indonesia",
  });

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25000;
  const total = subtotal + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Cart is empty");
    
    setIsSubmitting(true);
    try {
      const res = await processCheckout(formData, items);
      if (res.success) {
        clearCart();
        alert(`Order placed successfully! Order Number: ${res.orderNumber}`);
        router.push('/');
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert("Error processing checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-kalana-offwhite flex items-center justify-center">Loading...</div>;

  if (!isSignedIn && !guestMode) {
    return (
      <div className="min-h-screen bg-kalana-offwhite text-kalana-black flex items-center justify-center">
        <div className="max-w-md w-full px-6 flex flex-col items-center">
          <h1 className="text-3xl font-medium tracking-tight mb-8">Checkout</h1>
          <div className="w-full space-y-4">
            <Link href="/login" className="block w-full py-4 bg-kalana-black text-kalana-offwhite text-center font-semibold text-[10px] tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="block w-full py-4 border border-kalana-black text-kalana-black text-center font-semibold text-[10px] tracking-[0.2em] uppercase hover:bg-kalana-black/5 transition-colors">
              Create Account
            </Link>
          </div>
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

          <form onSubmit={handleCheckout} className="space-y-16">
            {/* Contact */}
            <section>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 text-kalana-black/50">Contact</h2>
              <div className="space-y-4">
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
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
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    placeholder="First Name" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                  <input 
                    type="text" 
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Last Name" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.address1}
                  onChange={e => setFormData({...formData, address1: e.target.value})}
                  placeholder="Address" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
                <input 
                  type="text" 
                  value={formData.address2}
                  onChange={e => setFormData({...formData, address2: e.target.value})}
                  placeholder="Apartment, suite, etc. (optional)" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
                <div className="grid grid-cols-2 gap-8">
                  <input 
                    type="text" 
                    required
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    placeholder="City" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                  <input 
                    type="text" 
                    required
                    value={formData.zip}
                    onChange={e => setFormData({...formData, zip: e.target.value})}
                    placeholder="Postal Code" 
                    className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                  />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.province}
                  onChange={e => setFormData({...formData, province: e.target.value})}
                  placeholder="Province / State" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="Phone Number" 
                  className="w-full bg-transparent border-b border-kalana-black/20 px-0 py-4 focus:outline-none focus:border-kalana-black transition-colors text-xs tracking-wider uppercase placeholder:text-kalana-black/30"
                />
              </div>
            </section>

            <div className="flex justify-between items-center pt-8">
              <Link href="/cart" className="text-[10px] text-kalana-black/50 hover:text-kalana-black transition-colors tracking-[0.2em] uppercase border-b border-transparent hover:border-kalana-black pb-1">
                Return to cart
              </Link>
              <button disabled={isSubmitting} type="submit" className="px-12 py-5 bg-kalana-black text-kalana-offwhite text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 transition-colors disabled:opacity-70">
                {isSubmitting ? 'Processing...' : 'Place Order'}
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
