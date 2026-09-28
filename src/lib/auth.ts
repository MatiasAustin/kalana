import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const ADMIN_ROLES = ['ADMIN', 'MANAGER', 'EDITOR'];

export async function checkAdminAccess() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/admin/login');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  });

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

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId)
  });

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
