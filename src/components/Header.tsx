import HeaderClient from './HeaderClient';
import { getSiteSettings, getNavigation, getLocation, getSocialLinks } from '@/lib/cms-api';

export default async function Header() {
  const settings = await getSiteSettings();
  const navigation = await getNavigation();
  const location = await getLocation();
  const socialLinks = await getSocialLinks();

  return (
    <HeaderClient 
      navLinks={navigation.header}
      brandName={settings.brandName}
      location={location}
      socialLinks={socialLinks}
    />
  );
}
