import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from './src/lib/db';
import { users, customers } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const c = await db.query.customers.findFirst({
    where: eq(customers.email, 'tiasaustin32@gmail.com')
  });

  if (c && c.userId) {
    await db.update(users).set({role: 'ADMIN'}).where(eq(users.id, c.userId));
    console.log('Updated user role to ADMIN');
  } else {
    console.log('User not found. Adding user...');
    
    // Check if user exists in users table directly
    const u = await db.query.users.findFirst({
      where: eq(users.role, 'CUSTOMER') // Maybe find by clerkUserId if we know it
    });
    
    console.log(u ? "Found some user..." : "No user found");
  }
  process.exit(0);
}

run();
