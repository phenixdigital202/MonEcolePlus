import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monecoleplus.ci'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tarifs',
          '/pricing',
          '/faq',
          '/contact',
          '/demo',
          '/login',
          '/signup',
          '/verify/document'
        ],
        disallow: [
          '/dashboard/',
          '/dashboard',
          '/super-admin/',
          '/super-admin',
          '/api/',
          '/_next/',
          '/reset-password',
          '/forgot-password'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/super-admin/',
          '/api/'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
