import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/database.types';

const protectedPagePrefixes = ['/dashboard', '/project'];
const protectedApiPrefix = '/api/v1';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedPage = protectedPagePrefixes.some((prefix) => pathname.startsWith(prefix));
  const isProtectedApi = pathname.startsWith(protectedApiPrefix);
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  let response = supabaseResponse;

  if ((isProtectedPage || isProtectedApi) && !user) {
    if (isProtectedApi) {
      response = NextResponse.json(
        {
          data: null,
          error: 'Unauthorized',
          meta: null,
          request_id: crypto.randomUUID(),
        },
        { status: 401 }
      );
    } else {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      response = NextResponse.redirect(loginUrl);
    }
  } else if (isLoginPage && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    response = NextResponse.redirect(dashboardUrl);
  } else if (isLandingPage && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    response = NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/project/:path*',
    '/api/v1/:path*',
    '/login',
  ],
};
