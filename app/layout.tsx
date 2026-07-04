import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Javier Martínez Álvarez',
  description: 'Product AI Engineer building private AI infrastructure at Zylon.',
  openGraph: {
    title: 'Javier Martínez Álvarez',
    description: 'Product AI Engineer building private AI infrastructure at Zylon.',
    url: 'https://jaluma.vercel.app',
    siteName: 'jaluma',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-bg text-text antialiased font-sans">{children}</body>
    </html>
  )
}
