import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-kalana-offwhite text-kalana-black border-t border-kalana-black/20 pt-24 pb-8">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Top minimal metadata */}
        <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-kalana-black/50 mb-16">
          <span>KALANA &copy; {new Date().getFullYear()}</span>
          <span>Cikampek, West Java</span>
          <span className="hidden sm:inline">All Rights Reserved</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
          <div className="md:col-span-6 lg:col-span-5">
            <h2 className="text-[10vw] sm:text-[8vw] md:text-7xl lg:text-9xl font-semibold tracking-tighter leading-none mb-6">kalana.</h2>
            <div className="flex gap-4 items-center">
              <span className="w-8 h-[1px] bg-kalana-black"></span>
              <p className="text-xs tracking-[0.2em] uppercase text-kalana-black/70">
                Space. Coffee. Further Days.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4">
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.2em] text-kalana-black/40 uppercase mb-6">Explore</h3>
              <ul className="space-y-4 text-xs tracking-widest uppercase">
                <li><Link href="/" className="hover:opacity-50 transition-opacity">Home</Link></li>
                <li><Link href="/space" className="hover:opacity-50 transition-opacity">Space</Link></li>
                <li><Link href="/roastery" className="hover:opacity-50 transition-opacity">Roastery</Link></li>
                <li><Link href="/goods" className="hover:opacity-50 transition-opacity">Goods</Link></li>
                <li><Link href="/about" className="hover:opacity-50 transition-opacity">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.2em] text-kalana-black/40 uppercase mb-6">Shop</h3>
              <ul className="space-y-4 text-xs tracking-widest uppercase">
                <li><Link href="/roastery" className="hover:opacity-50 transition-opacity">Roastbeans</Link></li>
                <li><Link href="/roastery/collection" className="hover:opacity-50 transition-opacity">Collections</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.2em] text-kalana-black/40 uppercase mb-6">Socials</h3>
              <ul className="space-y-4 text-xs tracking-widest uppercase">
                <li><Link href="#" className="hover:opacity-50 transition-opacity">Instagram</Link></li>
                <li><Link href="#" className="hover:opacity-50 transition-opacity">TikTok</Link></li>
                <li><Link href="#" className="hover:opacity-50 transition-opacity">WhatsApp</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 border-t border-kalana-black/20 text-[10px] tracking-widest uppercase text-kalana-black/50">
          <div className="flex gap-8 mb-4 sm:mb-0">
            <Link href="#" className="hover:text-kalana-black transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-kalana-black transition-colors">Terms of Service</Link>
          </div>
          <div className="vertical-text fixed right-6 bottom-32 hidden lg:block opacity-30 pointer-events-none text-xs">
            00 / KALANA
          </div>
        </div>
      </div>
    </footer>
  );
}
