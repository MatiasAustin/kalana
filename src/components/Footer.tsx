import Link from "next/link";
import { getSiteSettings, getNavigation, getSocialLinks, getLocation } from "@/lib/cms-api";
import { normalizeImageUrl } from "@/lib/image-util";

export const dynamic = "force-dynamic";

export default async function Footer() {
  const settings = await getSiteSettings();
  const navigation = await getNavigation();
  const socialLinks = await getSocialLinks();
  const location = await getLocation();

  return (
    <footer className="bg-kalana-offwhite text-kalana-black border-t border-kalana-black/20 pt-24 pb-8">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* Top minimal metadata */}
        <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-kalana-black/50 mb-16">
          <span>{settings.brandName} &copy; {new Date().getFullYear()}</span>
          <span>{location.address}, {location.province}</span>
          <span className="hidden sm:inline">All Rights Reserved</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
          <div className="md:col-span-6 lg:col-span-5">
            {settings.logoUrl ? (
              <div className="mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={normalizeImageUrl(settings.logoUrl)} 
                  alt={settings.brandName || "KALANA"} 
                  className="h-14 sm:h-20 w-auto object-contain max-w-[280px]"
                />
              </div>
            ) : (
              <h2 className="text-[10vw] sm:text-[8vw] md:text-7xl lg:text-9xl font-semibold tracking-tighter leading-none mb-6">
                {settings.brandName ? settings.brandName.toLowerCase() : "kalana"}.
              </h2>
            )}
            <div className="flex gap-4 items-center">
              <span className="w-8 h-[1px] bg-kalana-black"></span>
              <p className="text-xs tracking-[0.2em] uppercase text-kalana-black/70">
                {settings.tagline}
              </p>
            </div>
          </div>
          
          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4">
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.2em] text-kalana-black/40 uppercase mb-6">Explore</h3>
              <ul className="space-y-4 text-xs tracking-widest uppercase">
                {navigation.header.map((link: any) => (
                  <li key={link.url}>
                    <Link href={link.url} className="hover:opacity-50 transition-opacity">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.2em] text-kalana-black/40 uppercase mb-6">Shop</h3>
              <ul className="space-y-4 text-xs tracking-widest uppercase">
                {navigation.footer.map((link: any) => (
                  <li key={link.url}>
                    <Link href={link.url} className="hover:opacity-50 transition-opacity">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.2em] text-kalana-black/40 uppercase mb-6">Socials</h3>
              <ul className="space-y-4 text-xs tracking-widest uppercase">
                {socialLinks.map((social: any) => (
                  <li key={social.id || social.platform}>
                    <a 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:opacity-50 transition-opacity block"
                    >
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 border-t border-kalana-black/20 text-[10px] tracking-widest uppercase text-kalana-black/50">
          <div className="flex gap-8 mb-4 sm:mb-0">
            {navigation.legal.map((link: any) => (
              <Link key={link.url} href={link.url} className="hover:text-kalana-black transition-colors">{link.label}</Link>
            ))}
          </div>
          <div className="vertical-text fixed right-6 bottom-32 hidden lg:block opacity-30 pointer-events-none text-xs">
            00 / {settings.brandName}
          </div>
        </div>
      </div>
    </footer>
  );
}
