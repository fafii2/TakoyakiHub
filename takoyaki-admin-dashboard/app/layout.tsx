import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Serif_JP } from 'next/font/google'
import { Toaster } from 'sonner'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-noto-serif-jp',
})

export const metadata: Metadata = {
  title: 'Takoyaki Admin Dashboard',
  description: 'Mobile-first admin dashboard for managing takoyaki orders, menu, and sales records.',
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
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '1px solid #2A2A2A',
            },
          }}
        />
      </body>
    </html>
  )
}
