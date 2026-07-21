import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RegisterServiceWorker } from '@/shared/pwa/register-service-worker'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'QadamAI',
    template: '%s · QadamAI',
  },
  description: 'Цифровое сопровождение и ИИ-обзор после выдачи ТСР',
  applicationName: 'QadamAI',
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
