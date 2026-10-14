"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/store/cartStore";
import { processCheckout } from "@/lib/actions/checkout";
import { validateDiscountCode } from "@/lib/actions/marketing";
import { fetchCourierRates } from "@/lib/actions/shipping";
import { CourierRateOption } from "@/lib/shipping/biteship";
import { AlertCircle, Truck, Loader2 } from "lucide-react";

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

  // Discount code state
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number; description?: string } | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Courier & real-time shipping state
  const [courierRates, setCourierRates] = useState<CourierRateOption[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierRateOption | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [ratesNote, setRatesNote] = useState<string | null>(null);
  const [totalWeightGrams, setTotalWeightGrams] = useState<number>(0);

  // Auto-fetch courier rates whenever destination city, province, or zip changes
  useEffect(() => {
    const city = formData.city.trim();
    if (!city || city.length < 3 || items.length === 0) return;

    const timer = setTimeout(async () => {
      setIsLoadingRates(true);
      try {
        const res = await fetchCourierRates({
          city: formData.city,
          province: formData.province,
          zip: formData.zip,
          items: items.map((it) => ({
            name: it.name,
            variant: it.variant,
            price: it.price,
            quantity: it.quantity,
          })),
        });

        if (res.success && res.rates.length > 0) {
          setCourierRates(res.rates);
          setTotalWeightGrams(res.totalWeightGrams);
          setRatesNote(res.note || null);

          // Maintain selection or auto-select cheapest
          setSelectedCourier((prev) => {
            if (prev) {
              const matched = res.rates.find((r) => r.id === prev.id);
              if (matched) return matched;
            }
            return res.rates[0];
          });
        }
      } catch (err) {
        console.error("Error fetching rates", err);
      } finally {
        setIsLoadingRates(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.city, formData.province, formData.zip, items]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const baseShippingCost = selectedCourier ? selectedCourier.price : (courierRates[0]?.price ?? 25000);
  const shippingCost = appliedDiscount && appliedDiscount.code === "FREESHIP" ? 0 : baseShippingCost;
  const discountValue = appliedDiscount ? appliedDiscount.amount : 0;
  const total = Math.max(0, subtotal + shippingCost - (appliedDiscount?.code === "FREESHIP" ? 0 : discountValue));

  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) return;
    setIsValidatingCode(true);
    setDiscountError(null);
    try {
      const res = await validateDiscountCode(discountCodeInput, subtotal);
      if (res.valid && res.discount) {
        setAppliedDiscount({
          code: res.discount.code,
          amount: res.discountAmount || 0,
          description: res.discount.description,
        });
        setDiscountCodeInput("");
      } else {
        setDiscountError(res.error || "Invalid discount code");
      }
    } catch {
      setDiscountError("Failed to apply discount code");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (items.length === 0) {
      setCheckoutError("Keranjang belanja Anda masih kosong. Silakan tambahkan produk terlebih dahulu.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await processCheckout(formData, items, appliedDiscount, selectedCourier);
      if (res.success) {
        clearCart();
        if (res.paymentUrl) {
          window.location.href = res.paymentUrl;
        } else {
          router.push(`/checkout/success?order=${res.orderNumber}`);
        }
      } else {
        setCheckoutError(res.error || "Gagal memproses pesanan. Silakan periksa kembali data Anda.");
      }
    } catch (err: any) {
      setCheckoutError("Terjadi kendala saat memproses pesanan. Silakan coba kembali.");
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

            {/* Courier & Shipping Method */}
            <section className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-kalana-black/50">
                  Delivery Method / Kurir Pengiriman
                </h2>
                {totalWeightGrams > 0 && (
                  <span className="text-[10px] font-mono text-kalana-black/60 bg-kalana-black/5 px-2 py-0.5 rounded">
                    Total: {totalWeightGrams.toLocaleString("id-ID")}g ({(totalWeightGrams / 1000).toFixed(1)} kg)
                  </span>
                )}
              </div>

              {isLoadingRates ? (
                <div className="p-6 border border-dashed border-kalana-black/20 text-center rounded-sm bg-kalana-black/5 space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-kalana-black/60" />
                  <p className="text-xs text-kalana-black/70 font-mono">
                    Menghitung tarif ekspedisi real-time dari Roastery KALANA...
                  </p>
                </div>
              ) : courierRates.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2.5">
                    {courierRates.map((rate) => {
                      const isSelected = selectedCourier?.id === rate.id;
                      return (
                        <div
                          key={rate.id}
                          onClick={() => setSelectedCourier(rate)}
                          className={`p-3.5 border rounded-sm cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-kalana-black bg-kalana-black/5 shadow-xs"
                              : "border-kalana-black/15 bg-white hover:border-kalana-black/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-kalana-black bg-kalana-black" : "border-kalana-black/30"
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs font-mono uppercase text-kalana-black">
                                  {rate.courierName}
                                </span>
                                <span className="text-[11px] font-semibold text-kalana-black/80 font-sans">
                                  {rate.serviceName}
                                </span>
                                {rate.source === "biteship_live" && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono rounded font-medium">
                                    Biteship Live
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-kalana-black/50 block font-mono mt-0.5">
                                Estimasi sampai: {rate.etd}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-kalana-black">
                              IDR {rate.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {ratesNote && (
                    <p className="text-[10px] text-kalana-black/40 font-mono text-right">
                      {ratesNote} • Asal: Cikampek, Karawang
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 border border-kalana-black/15 rounded-sm bg-kalana-black/5 text-xs text-kalana-black/60 flex items-start sm:items-center gap-2.5 font-mono">
                  <Truck className="w-4 h-4 shrink-0 text-kalana-black/50 mt-0.5 sm:mt-0" />
                  <span>
                    Isi <strong>Kota / Kecamatan</strong> & <strong>Kode Pos</strong> tujuan di atas untuk memuat pilihan ekspedisi real-time (JNE, SiCepat, J&T, Anteraja).
                  </span>
                </div>
              )}
            </section>

            {checkoutError && (
              <div className="p-4 bg-red-50/90 border border-red-200 text-red-900 rounded-sm text-xs flex items-start gap-3 my-6 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1 font-sans">
                  <p className="font-semibold uppercase tracking-wider text-[11px] font-mono text-red-950">
                    Kendala Pemesanan
                  </p>
                  <p className="leading-relaxed text-red-800">
                    {checkoutError}
                  </p>
                </div>
              </div>
            )}

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

          {/* Discount Code Input Box */}
          <div className="mb-8 pt-4 border-t border-kalana-black/10">
            {appliedDiscount ? (
              <div className="flex items-center justify-between p-3 bg-white border border-kalana-black/20 rounded-sm">
                <div>
                  <span className="font-mono text-xs font-bold uppercase">{appliedDiscount.code}</span>
                  <span className="block text-[10px] text-kalana-black/60 font-mono">
                    {appliedDiscount.code === "FREESHIP"
                      ? "Free Shipping Applied"
                      : `- IDR ${appliedDiscount.amount.toLocaleString("id-ID")}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedDiscount(null)}
                  className="text-[10px] font-mono text-red-600 hover:text-red-800 uppercase tracking-wider font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="DISCOUNT CODE"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border border-kalana-black/20 px-3 py-2 text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-kalana-black placeholder:text-kalana-black/30"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={isValidatingCode || !discountCodeInput.trim()}
                    className="px-4 py-2 bg-kalana-black text-white text-[10px] font-mono tracking-widest uppercase hover:bg-kalana-black/80 disabled:opacity-50"
                  >
                    {isValidatingCode ? "..." : "Apply"}
                  </button>
                </div>
                {discountError && (
                  <p className="text-[10px] text-red-600 font-mono tracking-wider">{discountError}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 border-y border-kalana-black/20 py-8 mb-8 text-[10px] tracking-[0.2em] uppercase text-kalana-black/70">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-sm font-medium tracking-wide text-kalana-black">IDR {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span>Shipping</span>
                {selectedCourier && (
                  <span className="text-[9px] text-kalana-black/50 normal-case block font-mono mt-0.5">
                    {selectedCourier.courierName} {selectedCourier.serviceName} ({selectedCourier.etd})
                  </span>
                )}
              </div>
              <span className="text-sm font-medium tracking-wide text-kalana-black">
                {shippingCost === 0 ? "FREE" : `IDR ${shippingCost.toLocaleString('id-ID')}`}
              </span>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between items-center text-emerald-700">
                <span>Discount ({appliedDiscount?.code})</span>
                <span className="text-sm font-medium tracking-wide">- IDR {discountValue.toLocaleString('id-ID')}</span>
              </div>
            )}
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
