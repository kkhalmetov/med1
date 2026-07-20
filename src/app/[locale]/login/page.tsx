import { LoginForm } from '@/features/auth/login-form'
import { Link } from '@/i18n/navigation'
import { Brand } from '@/shared/ui/brand'
import { LocaleSwitcher } from '@/shared/ui/locale-switcher'

export default function LoginPage() {
  return (
    <main className="auth-page">
      <header className="public-header auth-page__header">
        <Brand compact />
        <LocaleSwitcher />
      </header>
      <div className="auth-page__content">
        <div className="auth-page__story" aria-hidden="true">
          <span className="auth-path auth-path--one">1</span>
          <span className="auth-path auth-path--two">2</span>
          <span className="auth-path auth-path--three">3</span>
          <p>Qadam</p>
        </div>
        <div>
          <LoginForm />
          <Link className="auth-page__back" href="/">
            ← Qadam
          </Link>
        </div>
      </div>
    </main>
  )
}
