import { NextResponse as Response, NextRequest } from 'next/server';

export default function middleware(req: NextRequest) {
  const token = req.cookies['auth-token'];
  const hasToken = !!token;

  if (req.nextUrl.pathname !== '/login' && !hasToken) {
    const redirectPath = req.url.replace(req.nextUrl.origin, '');
    const encodedUrl = req.url != '/' ? encodeURIComponent(redirectPath) : '';
    const params = encodedUrl ? `?url=${encodedUrl}` : '';

    return Response.redirect(`/login${params}`);
  }
}
