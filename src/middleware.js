import { NextResponse } from 'next/server';

export function middleware(request) {
  // Pour l'instant, on laisse tout passer
  // Cette fonction peut être utilisée plus tard pour protéger des routes spécifiques
  return NextResponse.next();
}

export const config = {
  // Appliquer le middleware seulement sur certaines routes si nécessaire
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};