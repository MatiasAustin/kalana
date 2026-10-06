import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isAdminApiRoute = createRouteMatcher(['/api/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  try {
    if (isAdminRoute(req) || isAdminApiRoute(req)) {
      const { userId } = await auth();
      
      if (!userId) {
        if (isAdminApiRoute(req)) {
          return new NextResponse('Unauthorized', { status: 401 });
        }
        
        // Clean redirect to login page with return URL
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect_url', req.nextUrl.pathname || '/admin');
        return NextResponse.redirect(loginUrl);
      }
    }
  } catch (error) {
    console.error('Middleware auth check error:', error);
    if (isAdminRoute(req)) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect_url', '/admin');
      return NextResponse.redirect(loginUrl);
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
