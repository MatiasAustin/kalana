import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateUploadUrl } from '@/lib/r2/client';
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

    const { filename, contentType, folder } = await req.json();

    if (!filename || !contentType) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Simple validation for images
    if (!contentType.startsWith('image/') && contentType !== 'application/pdf') {
       return new NextResponse('Invalid file type', { status: 400 });
    }

    const { uploadUrl, key, publicUrl } = await generateUploadUrl(filename, contentType, folder || 'misc');

    return NextResponse.json({ uploadUrl, key, publicUrl });
    
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
