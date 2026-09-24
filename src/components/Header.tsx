"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "SPACE", href: "/space" },
  { label: "ROASTERY", href: "/roastery" },
  { label: "GOODS", href: "/goods" },
  { label: "ABOUT", href: "/about" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openCart, items } = useCartStore();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Everything is off-white and black now, no transparent heroes to preserve the strict monochrome aesthetic unless required, but let's stick to black text on off-white or white.
  // Actually, some pages might have a dark hero, but the reference is extremely light/monochrome.
  // I will make the header solid off-white always or transparent but with black text.
  // Let's use a very clean, thin border on scroll.
  const headerStyles = clsx(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
    isScrolled ? "bg-kalana-offwhite/90 backdrop-blur-md py-4 border-b border-kalana-black/10" : "bg-transparent py-8 border-b border-transparent"
  );

  return (
    <>
      <header className={headerStyles}>
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="z-50 group flex items-center gap-2">
             {/* Small typographic logo */}
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-kalana-black group-hover:opacity-70 transition-opacity">
              KALANA
            </span>
            <span className="text-[10px] tracking-widest uppercase text-kalana-black/50 hidden sm:inline-block">/ EST. 2026</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-12 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={clsx(
                "text-[10px] tracking-[0.2em] uppercase transition-colors relative",
                pathname === link.href ? "text-kalana-black font-semibold" : "text-kalana-black/60 hover:text-kalana-black"
              )}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-8 z-50">
            <button className="hidden md:block text-kalana-black hover:opacity-60 transition-opacity">
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button 
              onClick={openCart} 
              className="relative flex items-center gap-2 text-kalana-black hover:opacity-60 transition-opacity group"
            >
              <span className="text-[10px] tracking-[0.2em] uppercase hidden sm:inline-block">Cart</span>
              <span className="text-[10px] tracking-widest border border-kalana-black/20 rounded-full px-2 py-0.5 group-hover:bg-kalana-black group-hover:text-kalana-offwhite transition-colors">
                {totalItems.toString().padStart(2, '0')}
              </span>
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-kalana-black"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "tween", duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-50 bg-kalana-offwhite flex flex-col pt-24 px-6 pb-12"
          >
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-8 right-6 p-2 text-kalana-black"
            >
              <X className="w-6 h-6" strokeWidth={1} />
            </button>
            
            <div className="text-[10px] tracking-widest text-kalana-black/40 uppercase mb-12">
              Menu / 001
            </div>

            <nav className="flex flex-col space-y-6">
              {NAV_LINKS.map((link, idx) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl md:text-6xl font-medium tracking-tight text-kalana-black flex items-center gap-6 group"
                >
                  <span className="text-xs text-kalana-black/30 font-normal w-6">0{idx + 1}</span>
                  <span className="group-hover:translate-x-4 transition-transform duration-300">{link.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="mt-auto pt-12 border-t border-kalana-black/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] tracking-widest text-kalana-black/50 uppercase mb-2">Location</p>
                <p className="text-sm tracking-wide">Cikampek, West Java</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-widest text-kalana-black/50 uppercase mb-2">Socials</p>
                <div className="flex gap-4 text-xs uppercase tracking-widest">
                  <Link href="#">IG</Link>
                  <Link href="#">TK</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
