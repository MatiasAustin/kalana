import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/r2/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  let key = '';
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return new NextResponse('Path is required', { status: 400 });
    }

    key = path.join('/');

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'kalana-media',
      Key: key,
    });

    const s3Response = await r2Client.send(command);

    if (!s3Response.Body) {
      return new NextResponse('Media not found', { status: 404 });
    }

    const stream = s3Response.Body.transformToWebStream();

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': s3Response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(s3Response.ETag ? { 'ETag': s3Response.ETag } : {}),
      },
    });
  } catch (error: any) {
    console.error('[MEDIA_PROXY_ERROR]', error);

    // Fallback: If S3 SDK fails, server fetches from R2 public endpoint
    try {
      if (key) {
        const r2Url = `https://pub-8f312cdd46f04b2bb59eca53807bddfc.r2.dev/${key}`;
        const res = await fetch(r2Url);
        if (res.ok && res.body) {
          return new Response(res.body, {
            status: 200,
            headers: {
              'Content-Type': res.headers.get('content-type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }
    } catch (fallbackErr) {
      console.error('[MEDIA_PROXY_FALLBACK_ERROR]', fallbackErr);
    }

    return new NextResponse('Image not found', { status: 404 });
  }
}
