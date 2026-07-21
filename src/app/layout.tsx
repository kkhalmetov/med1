import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RegisterServiceWorker } from '@/shared/pwa/register-service-worker'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Qadam',
    template: '%s · Qadam',
  },
  description: 'Цифровое сопровождение после выдачи протеза или ортеза',
  applicationName: 'Qadam',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/qadamm-q.svg',
    apple: '/icons/qadamm-q.svg',
  },
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html data-scroll-behavior="smooth" lang="ru">
      <body>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
