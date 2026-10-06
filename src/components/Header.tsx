import HeaderClient from './HeaderClient';
import { getSiteSettings, getNavigation, getLocation, getSocialLinks, getAnnouncement } from '@/lib/cms-api';
import { normalizeImageUrl } from '@/lib/image-util';

export const dynamic = "force-dynamic";

export default async function Header() {
  const [settings, navigation, location, socialLinks, announcement] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
    getLocation(),
    getSocialLinks(),
    getAnnouncement(),
  ]);

  return (
    <HeaderClient 
      navLinks={navigation.header}
      brandName={settings.brandName}
      logoUrl={normalizeImageUrl(settings.logoUrl)}
      location={location}
      socialLinks={socialLinks}
      announcement={announcement}
    />
  );
}
