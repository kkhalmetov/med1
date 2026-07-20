'use client'

import {
  Activity,
  Building2,
  ClipboardList,
  HeartPulse,
  Home,
  IdCard,
  MessageCircle,
  PackageOpen,
  Stethoscope,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import type { UserRole } from '@/features/auth/session'
import { LogoutButton } from '@/features/auth/logout-button'
import { Link, usePathname } from '@/i18n/navigation'
import { Brand } from './brand'
import { LocaleSwitcher } from './locale-switcher'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

function navigationFor(role: UserRole, t: ReturnType<typeof useTranslations<'nav'>>): NavItem[] {
  const shared = {
    home: {
      href: role === 'PATIENT' ? '/patient' : role === 'PRACTITIONER' ? '/practitioner' : '/admin',
      icon: Home,
      label: t('home'),
    },
    profile: { href: `/${role.toLowerCase()}/profile`, icon: UserRound, label: t('profile') },
  }
  if (role === 'PATIENT') {
    return [
      shared.home,
      { href: '/patient/reports', icon: Activity, label: t('reports') },
      { href: '/patient/complaints', icon: HeartPulse, label: t('complaints') },
      { href: '/patient/chat', icon: MessageCircle, label: t('chat') },
      { href: '/patient/devices', icon: PackageOpen, label: t('devices') },
      shared.profile,
    ]
  }
  if (role === 'PRACTITIONER') {
    return [
      shared.home,
      { href: '/practitioner/patients', icon: UsersRound, label: t('patients') },
      { href: '/practitioner/reports', icon: ClipboardList, label: t('reports') },
      { href: '/practitioner/complaints', icon: HeartPulse, label: t('complaints') },
      { href: '/practitioner/chat', icon: MessageCircle, label: t('chat') },
      { href: '/practitioner/devices', icon: PackageOpen, label: t('devices') },
      shared.profile,
    ]
  }
  return [
    shared.home,
    { href: '/admin/qualifications', icon: IdCard, label: t('qualifications') },
    { href: '/admin/organizations', icon: Building2, label: t('organizations') },
    { href: '/admin/practitioners', icon: Stethoscope, label: t('practitioners') },
    { href: '/admin/devices', icon: PackageOpen, label: t('devices') },
    { href: '/admin/dispenses', icon: ClipboardList, label: t('dispenses') },
    shared.profile,
  ]
}

export function AppShell({ role, children }: { role: UserRole; children: ReactNode }) {
  const t = useTranslations('nav')
  const enums = useTranslations('enums')
  const pathname = usePathname()
  const items = navigationFor(role, t)

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <Brand compact />
        <div className="app-shell__role">
          <span>{enums(role)}</span>
        </div>
        <nav className="app-nav" aria-label={t('menu')}>
          {items.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href || (href !== items[0]?.href && pathname.startsWith(`${href}/`))
            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className="app-nav__link"
                href={href}
                key={href}
              >
                <Icon aria-hidden="true" size={19} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <LogoutButton />
      </aside>

      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <Brand compact />
          <div className="app-shell__topbar-actions">
            <LocaleSwitcher />
            <Link
              className="app-shell__avatar"
              href={`/${role.toLowerCase()}/profile`}
              aria-label={t('profile')}
            >
              <UserRound aria-hidden="true" size={20} />
            </Link>
          </div>
        </header>
        <main className="app-shell__content">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label={t('menu')}>
        {items.slice(0, 5).map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link aria-current={active ? 'page' : undefined} href={href} key={href}>
              <Icon aria-hidden="true" size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
