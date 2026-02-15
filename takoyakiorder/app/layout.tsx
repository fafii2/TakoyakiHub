import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Serif_JP } from 'next/font/google'

import './globals.css'

const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const _notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-noto-serif-jp',
})

export const metadata: Metadata = {
  title: 'Takoyaki - Fresh, Hot, Made to Order',
  description: 'Order authentic Japanese takoyaki online. Fresh octopus balls made to order with premium ingredients.',
}

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_notoSerifJP.variable}`}>
      <body className="font-sans antialiased relative">{children}</body>
    </html>
  )
}
