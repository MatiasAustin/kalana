import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/cms-api';
import { normalizeImageUrl } from '@/lib/image-util';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const settings = await getSiteSettings();
    const faviconUrl = normalizeImageUrl(settings?.faviconUrl) || '/api/media/kalana/branding/785cdee7-af52-4902-b6a3-dde9904a2421.png';
    return NextResponse.redirect(new URL(faviconUrl, request.url), 307);
  } catch (error) {
    console.error('[FAVICON_ROUTE_ERROR]', error);
  }

  return NextResponse.redirect(
    new URL('/api/media/kalana/branding/785cdee7-af52-4902-b6a3-dde9904a2421.png', request.url),
    307
  );
}
