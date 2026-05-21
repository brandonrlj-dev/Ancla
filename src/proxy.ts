import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the Supabase JWT — do NOT add logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPoliceRoute = request.nextUrl.pathname.startsWith('/policia')
  const isPoliceLogin = request.nextUrl.pathname.startsWith('/policia/login')

  if (isPoliceRoute && !isPoliceLogin && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/policia/login'
    return NextResponse.redirect(loginUrl)
  }

  if (isPoliceLogin && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/policia'
    return NextResponse.redirect(dashboardUrl)
  }

  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|icons|sw\\.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
