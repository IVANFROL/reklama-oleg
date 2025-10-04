import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import FloatingAdBanner from '@/components/FloatingAdBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Корпоративный сайт',
  description: 'Личный кабинет с просмотром рекламы за голду и системой заявок',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <FloatingAdBanner />
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
