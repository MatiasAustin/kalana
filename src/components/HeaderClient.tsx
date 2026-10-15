"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useAuth } from "@clerk/nextjs";

export default function HeaderClient({ navLinks, brandName, logoUrl, location, socialLinks, announcement }: any) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openCart, items } = useCartStore();
  const { isSignedIn, isLoaded } = useAuth();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {announcement?.isEnabled && announcement?.text && (
          <div
            style={{
              backgroundColor: announcement.bgColor || "#0A0A0A",
              color: announcement.textColor || "#FFFFFF",
            }}
            className="w-full text-center py-2 px-4 text-[11px] font-mono tracking-wider flex items-center justify-center gap-2 border-b border-black/10 transition-colors"
          >
            <span>{announcement.text}</span>
            {announcement.linkUrl && (
              <Link
                href={announcement.linkUrl}
                className="underline underline-offset-2 hover:opacity-80 transition-opacity font-bold ml-1 inline-flex items-center gap-0.5"
              >
                {announcement.linkText || "Explore"} →
              </Link>
            )}
          </div>
        )}

        <header
          className={clsx(
            "transition-all duration-300",
            isScrolled
              ? "bg-kalana-offwhite/95 backdrop-blur-md py-3 sm:py-4 border-b border-kalana-black/10 shadow-2xs"
              : "bg-kalana-offwhite/80 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none py-3 sm:py-6 border-b border-kalana-black/5 md:border-transparent"
          )}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="z-50 group flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brandName || "KALANA"} className="h-6 sm:h-8 w-auto object-contain max-h-8 sm:max-h-9" />
            ) : (
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-kalana-black group-hover:opacity-70 transition-opacity">
                {brandName}
              </span>
            )}
            <span className="text-[10px] tracking-widest uppercase text-kalana-black/50 hidden sm:inline-block">/ EST. 2026</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-12 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link: any) => (
              <Link key={link.url} href={link.url} className={clsx(
                "text-[10px] tracking-[0.2em] uppercase transition-colors relative",
                pathname === link.url ? "text-kalana-black font-semibold" : "text-kalana-black/60 hover:text-kalana-black"
              )}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 z-50">
            <button className="hidden md:block text-kalana-black hover:opacity-60 transition-opacity">
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </button>
            {isLoaded && isSignedIn ? (
              <Link href="/account" className="hidden md:block text-[10px] tracking-[0.2em] uppercase text-kalana-black hover:opacity-60 transition-opacity">
                Account
              </Link>
            ) : isLoaded ? (
              <Link href="/login" className="hidden md:block text-[10px] tracking-[0.2em] uppercase text-kalana-black hover:opacity-60 transition-opacity">
                Account
              </Link>
            ) : null}
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
              className="md:hidden text-kalana-black p-1 hover:opacity-60 transition-opacity"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>
    </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-50 bg-kalana-offwhite flex flex-col pt-20 px-6 pb-12 overflow-y-auto"
          >
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-kalana-black hover:opacity-60 transition-opacity"
              aria-label="Close navigation menu"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
            
            <div className="text-[10px] tracking-widest text-kalana-black/40 uppercase mb-8 font-mono">
              Menu / Navigation
            </div>

            <nav className="flex flex-col space-y-5 mb-10">
              {navLinks.map((link: any, idx: number) => (
                <Link 
                  key={link.url} 
                  href={link.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl sm:text-5xl font-medium tracking-tight text-kalana-black flex items-center gap-4 group"
                >
                  <span className="text-xs text-kalana-black/30 font-mono w-6">0{idx + 1}</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">{link.label}</span>
                </Link>
              ))}

              {/* Mobile Tracking Link */}
              <Link 
                href="/tracking"
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl sm:text-5xl font-medium tracking-tight text-kalana-black flex items-center gap-4 group"
              >
                <span className="text-xs text-kalana-black/30 font-mono w-6">0{navLinks.length + 1}</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">Tracking Radar</span>
              </Link>

              {/* Mobile Account Link */}
              <Link 
                href={isLoaded && isSignedIn ? "/account" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl sm:text-5xl font-medium tracking-tight text-kalana-black flex items-center gap-4 group"
              >
                <span className="text-xs text-kalana-black/30 font-mono w-6">0{navLinks.length + 2}</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">
                  {isLoaded && isSignedIn ? "My Account" : "Sign In"}
                </span>
              </Link>
            </nav>
            
            <div className="mt-auto pt-8 border-t border-kalana-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 font-mono">
              <div>
                <p className="text-[10px] tracking-widest text-kalana-black/50 uppercase mb-1">Location</p>
                <p className="text-xs tracking-wide">{location?.address || "Cikampek"}, {location?.province || "Jawa Barat"}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] tracking-widest text-kalana-black/50 uppercase mb-1">Socials</p>
                <div className="flex gap-4 text-xs uppercase tracking-widest">
                  {socialLinks?.map((social: any) => (
                    <Link key={social.platform} href={social.url} target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity">
                      {social.platform.substring(0, 2).toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
