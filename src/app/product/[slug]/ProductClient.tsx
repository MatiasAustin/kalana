"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";

export default function ProductClient({ product }: { product: any }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product?.variants?.[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  if (!product) {
    return <div className="pt-40 text-center pb-40 uppercase tracking-[0.2em] text-xs">Product not found.</div>;
  }

  // Handle Variants
  const variants = product.variants || [];
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || variants[0];
  const price = selectedVariant ? selectedVariant.price : 0;
  
  // Handle Media
  const primaryMedia = product.media?.find((m: any) => m.isPrimary)?.media || product.media?.[0]?.media;
  const secondaryMedia = product.media?.filter((m: any) => !m.isPrimary).slice(0, 2).map((m: any) => m.media) || [];

  // Metadata
  const type = product.category || "Coffee";
  const body = product.body || "Full";
  const acidity = product.acidity || "Low";
  const description = product.description || "Everyday essential.";
  const brewingGuide = ["Espresso", "Filter"];
  const tastingNotes = product.tastingNotes ? product.tastingNotes.split(', ') : ["Balanced"];

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    addItem({
      id: product.id,
      name: product.name,
      collection: product.collection || 'General',
      variant: selectedVariant.name,
      price: price,
      quantity: quantity,
      image: primaryMedia?.url || ""
    });
  };

  return (
    <div className="w-full bg-kalana-offwhite pt-32 pb-24 text-kalana-black min-h-screen">
      
      {/* Editorial Breadcrumbs */}
      <div className="container mx-auto px-6 lg:px-12 mb-12 flex justify-between items-center border-b border-kalana-black/20 pb-4">
        <div className="flex gap-4 text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">
          <Link href="/roastery" className="hover:text-kalana-black transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-kalana-black">{product.name}</span>
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/30">
          SKU: {selectedVariant?.sku || product.id}
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        {/* Split Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 border-b border-kalana-black/20 pb-24 mb-24">
          
          {/* Left: Large Product Image */}
          <div className="lg:col-span-6 lg:border-r border-kalana-black/20 lg:pr-12">
            <div className="w-full aspect-[3/4] bg-kalana-black/5 border border-kalana-black/10 relative overflow-hidden">
               {primaryMedia ? (
                 <img src={primaryMedia.url} alt={product.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.2em] text-kalana-black/20 uppercase">No Image</div>
               )}
            </div>
            {secondaryMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {secondaryMedia.map((media: any) => (
                  <div key={media.id} className="aspect-square bg-kalana-black/5 border border-kalana-black/10 overflow-hidden">
                    <img src={media.url} alt="Detail" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-6 lg:pl-12 flex flex-col">
            
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl font-semibold uppercase tracking-tighter mb-4 leading-none">{product.name}</h1>
              <p className="text-[10px] tracking-[0.2em] text-kalana-black/50 uppercase border-b border-kalana-black/10 pb-4 inline-block">{type}</p>
            </div>

            <div className="space-y-6 mb-12">
              <div className="grid grid-cols-12 border-b border-kalana-black/10 pb-2">
                <span className="col-span-4 text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">Blend</span>
                <span className="col-span-8 text-xs font-medium tracking-wider uppercase">{product.blend || '-'}</span>
              </div>
              <div className="grid grid-cols-12 border-b border-kalana-black/10 pb-2">
                <span className="col-span-4 text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">Roast</span>
                <span className="col-span-8 text-xs font-medium tracking-wider uppercase">{product.roast || '-'}</span>
              </div>
              <div className="grid grid-cols-12 border-b border-kalana-black/10 pb-2">
                <span className="col-span-4 text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">Tasting Notes</span>
                <span className="col-span-8 text-xs font-medium tracking-wider uppercase">{tastingNotes.join(" / ")}</span>
              </div>
            </div>

            <div className="mb-12">
              <div className="flex justify-between items-end border-b border-kalana-black/20 pb-4 mb-8">
                 <span className="text-2xl font-medium tracking-tight">IDR {price.toLocaleString('id-ID')}</span>
                 <span className="text-[10px] tracking-[0.2em] uppercase text-kalana-black/50">Tax Incl.</span>
              </div>

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div className="mb-8">
                  <span className="block text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">Variant</span>
                  <div className="flex flex-wrap gap-4">
                    {variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-8 py-3 text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                          selectedVariantId === v.id 
                            ? "border-kalana-black bg-kalana-black text-kalana-offwhite" 
                            : "border-kalana-black/20 bg-transparent text-kalana-black hover:border-kalana-black"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-12">
                <span className="block text-[10px] tracking-[0.2em] uppercase text-kalana-black/50 mb-4">Quantity</span>
                <div className="flex items-center border border-kalana-black w-max">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-kalana-black/5 transition-colors">
                    <Minus className="w-3 h-3" strokeWidth={1} />
                  </button>
                  <span className="w-10 text-center text-[10px] font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-kalana-black/5 transition-colors">
                    <Plus className="w-3 h-3" strokeWidth={1} />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className="w-full py-4 bg-kalana-black border border-kalana-black text-kalana-offwhite text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-kalana-black/80 disabled:opacity-50 transition-colors"
                >
                  Add to Cart
                </button>
                <Link href="/checkout" onClick={handleAddToCart} className="w-full py-4 bg-transparent border border-kalana-black/20 text-kalana-black text-[10px] font-semibold tracking-[0.2em] uppercase hover:border-kalana-black text-center transition-colors">
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Specs Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          <div className="md:col-span-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 text-kalana-black/50 border-b border-kalana-black/20 pb-4">Product Story</h2>
            <p className="text-kalana-black font-light leading-relaxed text-sm lg:text-base">
              {description}
            </p>
          </div>
          
          <div className="md:col-span-7">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-6 text-kalana-black/50 border-b border-kalana-black/20 pb-4">Technical Specs</h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="border-b border-kalana-black/10 pb-4">
                <h3 className="text-[10px] text-kalana-black/40 tracking-[0.2em] uppercase mb-1">Body</h3>
                <p className="text-sm font-medium uppercase tracking-wider">{body}</p>
              </div>
              <div className="border-b border-kalana-black/10 pb-4">
                <h3 className="text-[10px] text-kalana-black/40 tracking-[0.2em] uppercase mb-1">Acidity</h3>
                <p className="text-sm font-medium uppercase tracking-wider">{acidity}</p>
              </div>
              <div className="col-span-2 border-b border-kalana-black/10 pb-4">
                <h3 className="text-[10px] text-kalana-black/40 tracking-[0.2em] uppercase mb-4">Recommended Brewing</h3>
                <div className="flex flex-wrap gap-4">
                  {brewingGuide.map((method: string) => (
                    <span key={method} className="text-[10px] border border-kalana-black px-3 py-1 uppercase tracking-widest">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
