import { Activity, ArrowRight, HeartHandshake, MessageCircleMore } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Brand } from '@/shared/ui/brand'
import { LocaleSwitcher } from '@/shared/ui/locale-switcher'

export default async function LocaleHomePage() {
  const t = await getTranslations('landing')

  return (
    <main className="public-shell" id="top">
      <header className="public-header">
        <Brand />
        <nav className="public-header__actions" aria-label="Primary">
          <LocaleSwitcher />
          <Link className="button button--secondary button--compact" href="/login">
            {t('signIn')}
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1>{t('title')}</h1>
          <p className="hero__lead">{t('description')}</p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/login">
              {t('signIn')} <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <a className="button button--ghost" href="#how-it-works">
              {t('howItWorks')}
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual__orbit" />
          <div className="hero-visual__card hero-visual__card--primary">
            <span className="hero-visual__pulse">
              <Activity size={25} />
            </span>
            <small>Qadam</small>
            <strong>{t('stepOne')}</strong>
            <div className="hero-visual__scale">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="hero-visual__card hero-visual__card--message">
            <MessageCircleMore size={21} />
            <span>{t('stepThree')}</span>
          </div>
          <div className="hero-visual__step hero-visual__step--one">1</div>
          <div className="hero-visual__step hero-visual__step--two">2</div>
          <div className="hero-visual__step hero-visual__step--three">3</div>
        </div>
      </section>

      <section className="journey" id="how-it-works">
        <div className="journey__heading">
          <p className="eyebrow">Qadam</p>
          <h2>{t('howItWorks')}</h2>
        </div>
        <ol className="journey__grid">
          <li>
            <span>
              <HeartHandshake size={22} />
            </span>
            <strong>{t('stepOne')}</strong>
          </li>
          <li>
            <span>
              <Activity size={22} />
            </span>
            <strong>{t('stepTwo')}</strong>
          </li>
          <li>
            <span>
              <MessageCircleMore size={22} />
            </span>
            <strong>{t('stepThree')}</strong>
          </li>
        </ol>
      </section>

      <footer className="public-footer">
        <Brand compact href="#top" />
        <span>© 2026 Qadam</span>
      </footer>
    </main>
  )
}
