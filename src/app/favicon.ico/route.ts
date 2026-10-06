import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/cms-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getSiteSettings();
    if (settings?.faviconUrl) {
      return NextResponse.redirect(settings.faviconUrl, 307);
    }
  } catch (error) {
    console.error('[FAVICON_ROUTE_ERROR]', error);
  }

  return NextResponse.redirect(
    'https://pub-8f312cdd46f04b2bb59eca53807bddfc.r2.dev/kalana/branding/785cdee7-af52-4902-b6a3-dde9904a2421.png',
    307
  );
}
