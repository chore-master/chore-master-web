import AppLayout from '@/components/AppLayout'
import ThemeProvider from '@/components/ThemeProvider'
import { routing } from '@/i18n/routing'
import { GoogleAnalyticsProvider } from '@/utils/googleAnalytics'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chore Master Learn',
  description: 'Chore Master Learn',
  icons: {
    icon: [
      { url: '/images/logo.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/images/logo.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    shortcut: '/images/logo.svg',
    apple: '/images/logo.svg',
  },
}

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalyticsProvider>
          <NextIntlClientProvider>
            <AppRouterCacheProvider>
              <ThemeProvider>
                <AppLayout>{children}</AppLayout>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </NextIntlClientProvider>
        </GoogleAnalyticsProvider>
      </body>
    </html>
  )
}
