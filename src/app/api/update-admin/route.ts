import { db } from '@/lib/db';
import { users, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ success: false, message: 'Not logged into Clerk.' });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    // Check if user exists in Turso
    let internalUser = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId)
    });

    if (internalUser) {
      await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, internalUser.id));
    } else {
      // Create them directly as ADMIN
      const internalUserId = uuidv4();
      await db.insert(users).values({
        id: internalUserId,
        clerkUserId: userId,
        role: 'ADMIN',
      });

      await db.insert(customers).values({
        id: uuidv4(),
        userId: internalUserId,
        email: email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }

    return NextResponse.json({ success: true, message: `Updated user ${email} to ADMIN.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
