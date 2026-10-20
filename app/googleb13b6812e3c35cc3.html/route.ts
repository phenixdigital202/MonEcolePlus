import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('google-site-verification: googleb13b6812e3c35cc3.html', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
