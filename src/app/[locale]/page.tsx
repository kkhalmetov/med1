type LocaleHomePageProps = Readonly<{
  params: Promise<{ locale: string }>
}>

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params

  return (
    <main>
      <h1>Qadam</h1>
      <p>{locale === 'kk' ? 'Әр қадам бақылауда' : 'Каждый шаг под контролем'}</p>
    </main>
  )
}
