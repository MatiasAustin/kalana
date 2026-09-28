import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isAdminApiRoute = createRouteMatcher(['/api/admin(.*)']);
// Exclude the admin login route from protection
const isAdminLoginRoute = createRouteMatcher(['/auth/admin-login(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminLoginRoute(req)) {
    return;
  }

  if (isAdminRoute(req) || isAdminApiRoute(req)) {
    const authObj = await auth();
    
    if (!authObj.userId) {
      if (isAdminApiRoute(req)) {
        return new Response('Unauthorized', { status: 401 });
      }
      // Redirect to custom admin login
      const url = new URL('/auth/admin-login', req.url);
      return Response.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
