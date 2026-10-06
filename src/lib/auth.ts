import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export const ADMIN_ROLES = ['ADMIN', 'MANAGER', 'EDITOR'];

export async function checkAdminAccess() {
  let userId: string | null = null;
  try {
    const authObj = await auth();
    userId = authObj?.userId || null;
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') throw err;
    console.error('Clerk auth error in checkAdminAccess:', err);
    redirect('/login?redirect_url=/admin');
  }

  if (!userId) {
    redirect('/login?redirect_url=/admin');
  }

  let user = null;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId)
    });
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') throw err;
    console.error('Database error in checkAdminAccess finding user:', err);
  }

  // If user does not exist in Turso DB yet (e.g. webhook not configured or first login)
  if (!user) {
    try {
      const existingUsers = await db.query.users.findMany({ limit: 1 }).catch(() => []);
      const clerkUser = await currentUser().catch(() => null);
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
      
      // If there are no users in DB yet, auto-promote the first user to ADMIN
      const shouldBeAdmin = existingUsers.length === 0;
      const internalUserId = uuidv4();
      
      await db.insert(users).values({
        id: internalUserId,
        clerkUserId: userId,
        role: shouldBeAdmin ? 'ADMIN' : 'CUSTOMER',
      }).catch((e) => console.error('Auto-create user failed:', e));

      if (email) {
        await db.insert(customers).values({
          id: uuidv4(),
          userId: internalUserId,
          email: email,
          firstName: clerkUser?.firstName || null,
          lastName: clerkUser?.lastName || null,
        }).catch((e) => console.error('Auto-create customer profile failed:', e));
      }

      if (shouldBeAdmin) {
        return {
          id: internalUserId,
          clerkUserId: userId,
          role: 'ADMIN',
        };
      }
    } catch (createErr: any) {
      if (createErr?.digest?.startsWith('NEXT_REDIRECT') || createErr?.message === 'NEXT_REDIRECT') throw createErr;
      console.error('Error auto-provisioning user:', createErr);
    }
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect('/unauthorized');
  }

  return user;
}

export async function requireAdminApi() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  let user = null;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, userId)
    });
  } catch (err: any) {
    console.error('Database error in requireAdminApi:', err);
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
