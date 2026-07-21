import {
  Activity,
  ArrowRight,
  Database,
  HeartHandshake,
  MessageCircleMore,
  ScanText,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Brand } from '@/shared/ui/brand'
import { GithubLink } from '@/shared/ui/github-link'
import { LocaleSwitcher } from '@/shared/ui/locale-switcher'

export default async function LocaleHomePage() {
  const t = await getTranslations('landing')

  return (
    <main className="public-shell" id="top">
      <header className="public-header">
        <Brand />
        <nav className="public-header__actions" aria-label="Primary">
          <GithubLink />
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
            <small>QadamAI</small>
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
          <p className="eyebrow">QadamAI</p>
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

      <section className="ai-overview" aria-labelledby="ai-overview-title">
        <div className="ai-overview__intro">
          <p className="eyebrow">{t('aiEyebrow')}</p>
          <h2 id="ai-overview-title">{t('aiTitle')}</h2>
          <p className="ai-overview__lead">{t('aiDescription')}</p>
          <p className="ai-overview__note">
            <ShieldCheck aria-hidden="true" size={21} />
            <span>{t('aiNote')}</span>
          </p>
        </div>
        <ol className="ai-overview__flow">
          <li>
            <span className="ai-overview__number">01</span>
            <span className="ai-overview__icon">
              <Database aria-hidden="true" size={22} />
            </span>
            <span className="ai-overview__copy">
              <strong>{t('aiCollectTitle')}</strong>
              <small>{t('aiCollectDescription')}</small>
            </span>
          </li>
          <li>
            <span className="ai-overview__number">02</span>
            <span className="ai-overview__icon">
              <ScanText aria-hidden="true" size={22} />
            </span>
            <span className="ai-overview__copy">
              <strong>{t('aiHighlightTitle')}</strong>
              <small>{t('aiHighlightDescription')}</small>
            </span>
          </li>
          <li>
            <span className="ai-overview__number">03</span>
            <span className="ai-overview__icon">
              <UserRoundCheck aria-hidden="true" size={22} />
            </span>
            <span className="ai-overview__copy">
              <strong>{t('aiAssistTitle')}</strong>
              <small>{t('aiAssistDescription')}</small>
            </span>
          </li>
        </ol>
      </section>

      <footer className="public-footer">
        <Brand compact href="#top" />
        <span>© 2026 QadamAI</span>
      </footer>
    </main>
  )
}
