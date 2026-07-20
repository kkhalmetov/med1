export const locales = ['ru', 'kk'] as const
export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/')
  if (segments[1] && isLocale(segments[1])) segments[1] = locale
  else segments.splice(1, 0, locale)
  return segments.join('/') || `/${locale}`
}
