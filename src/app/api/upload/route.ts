import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadToR2, generateUploadUrl } from '@/lib/r2/client';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify admin role
    const userRecord = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId)
    });

    if (!userRecord || !['ADMIN', 'EDITOR', 'MANAGER'].includes(userRecord.role)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const contentTypeHeader = req.headers.get('content-type') || '';

    // 1. Direct file upload via FormData (Server-side upload - No CORS or ISP issues)
    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folder = (formData.get('folder') as string) || 'misc';

      if (!file) {
        return new NextResponse('Missing file', { status: 400 });
      }

      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        return new NextResponse('Invalid file type', { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { key, publicUrl } = await uploadToR2(buffer, file.name, file.type, folder);

      return NextResponse.json({
        success: true,
        key,
        publicUrl,
        url: publicUrl,
      });
    }

    // 2. Fallback: Presigned URL via JSON
    const { filename, contentType, folder } = await req.json();

    if (!filename || !contentType) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Simple validation for images
    if (!contentType.startsWith('image/') && contentType !== 'application/pdf') {
       return new NextResponse('Invalid file type', { status: 400 });
    }

    const { uploadUrl, key, publicUrl } = await generateUploadUrl(filename, contentType, folder || 'misc');

    return NextResponse.json({ uploadUrl, key, publicUrl, url: publicUrl });
    
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
