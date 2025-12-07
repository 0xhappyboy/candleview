export function middleware(request: Request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    return null;
  }
  return null;
}

export const config = {
  matcher: '/:path*',
};
