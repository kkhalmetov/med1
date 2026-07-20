import { getTranslations } from 'next-intl/server'

export default async function LocaleHomePage() {
  const t = await getTranslations('landing')

  return (
    <main>
      <h1>Qadam</h1>
      <p>{t('slogan')}</p>
    </main>
  )
}
