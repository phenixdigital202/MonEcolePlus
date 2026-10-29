import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/sonner"
import './globals.css'

// Utilisation des polices système natives pour la robustesse du build hors-ligne
const inter = { variable: 'font-sans' };
const geistMono = { variable: 'font-mono' };

const siteUrl = 'https://monecoleplus.ci'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MonÉcole+ (Mon Ecole Plus) — Plateforme de Gestion Scolaire Intelligente',
    template: '%s | MonÉcole+ (Mon Ecole Plus)'
  },
  description: 'MonÉcole+ (Mon Ecole Plus) est le logiciel SaaS tout-en-un de gestion scolaire en Côte d\'Ivoire : bulletins de notes automatiques, certificats QR infalsifiables, notifications WhatsApp & SMS aux parents, emplois du temps et suivi des moyennes.',
  applicationName: 'MonÉcole+',
  authors: [{ name: 'MonÉcole+', url: siteUrl }],
  generator: 'Next.js',
  keywords: [
    'Mon ecole plus',
    'Mon école plus',
    'MonEcolePlus',
    'monecoleplus.ci',
    'monecole plus',
    'ecole plus',
    'ecole plus ci',
    'gestion scolaire',
    'gestion scolaire cote d\'ivoire',
    'logiciel de gestion scolaire',
    'bulletin scolaire cote d\'ivoire',
    'logiciel scolaire abidjan',
    'plateforme éducative ivoirienne',
    'bulletin de notes automatisé',
    'suivi des absences et moyennes',
    'certificat de scolarité qr code',
    'sms whatsapp parents ecole',
    'saas gestion ecole afrique'
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'MonÉcole+ (Mon Ecole Plus) — Gestion Scolaire Intelligente',
    description: 'La solution SaaS tout-en-un pour les collèges, lycées et groupes scolaires : bulletins de notes, WhatsApp/SMS, notes et absences en temps réel.',
    url: siteUrl,
    siteName: 'MonÉcole+ (Mon Ecole Plus)',
    locale: 'fr_CI',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 675,
        alt: 'MonÉcole+ (Mon Ecole Plus) — Plateforme de gestion scolaire tout-en-un',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MonÉcole+ (Mon Ecole Plus) — Gestion Scolaire Intelligente',
    description: 'Logiciel SaaS tout-en-un pour les écoles, collèges et lycées en Côte d\'Ivoire : bulletins scolaires, notes, SMS et WhatsApp.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'googleb13b6812e3c35cc3',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f1a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://monecoleplus.ci/#organization',
      name: 'MonÉcole+',
      alternateName: ['Mon ecole plus', 'Mon école plus', 'MonEcolePlus', 'Mon Ecole Plus CI'],
      url: 'https://monecoleplus.ci',
      logo: 'https://monecoleplus.ci/icon.svg',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'CI',
        addressLocality: 'Abidjan'
      }
    },
    {
      '@type': 'WebSite',
      '@id': 'https://monecoleplus.ci/#website',
      url: 'https://monecoleplus.ci',
      name: 'MonÉcole+ (Mon Ecole Plus)',
      alternateName: ['Mon ecole plus', 'Mon école plus', 'MonEcolePlus'],
      publisher: { '@id': 'https://monecoleplus.ci/#organization' }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://monecoleplus.ci/#software',
      name: 'MonÉcole+',
      alternateName: ['Mon ecole plus', 'Mon école plus', 'MonEcolePlus'],
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, iOS, Android',
      url: 'https://monecoleplus.ci',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'XOF',
        description: 'Essai gratuit 14 jours sans engagement'
      },
      description: 'Plateforme SaaS tout-en-un de gestion des établissements scolaires en Côte d\'Ivoire : bulletins scolaires, notes, relevés, WhatsApp et SMS.'
    }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-200">
        {/* Schema.org JSON-LD Structured Data for Google Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('MonÉcole+ SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('MonÉcole+ SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

