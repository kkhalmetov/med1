'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from '@/i18n/navigation'
import { loginSchema, type LoginValues } from './schema'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'

const roleDestinations = {
  PATIENT: '/patient',
  PRACTITIONER: '/practitioner',
  ADMIN: '/admin',
} as const

export function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [serverError, setServerError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const submit = handleSubmit(async (values) => {
    setServerError(undefined)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!response.ok) {
        setServerError(response.status === 401 ? t('invalid') : t('invalid'))
        return
      }
      const session = (await response.json()) as { role: keyof typeof roleDestinations }
      const destination = roleDestinations[session.role]
      if (!destination) {
        setServerError(t('invalid'))
        return
      }
      router.replace(destination)
      router.refresh()
    } catch {
      setServerError(t('invalid'))
    }
  })

  return (
    <form className="login-form" onSubmit={submit} noValidate>
      <div className="login-form__icon" aria-hidden="true">
        <LockKeyhole size={25} />
      </div>
      <div>
        <p className="eyebrow">Qadam</p>
        <h1>{t('title')}</h1>
        <p className="login-form__subtitle">{t('subtitle')}</p>
      </div>
      {serverError ? (
        <div className="form-alert" role="alert">
          {serverError}
        </div>
      ) : null}
      <Field
        autoComplete="email"
        error={errors.email ? t('invalid') : undefined}
        label={t('email')}
        placeholder="name@example.kz"
        type="email"
        {...register('email')}
      />
      <Field
        autoComplete="current-password"
        error={errors.password ? t('invalid') : undefined}
        label={t('password')}
        type="password"
        {...register('password')}
      />
      <Button className="login-form__submit" loading={isSubmitting} type="submit">
        {isSubmitting ? t('signingIn') : t('submit')}
        {isSubmitting ? null : <ArrowRight aria-hidden="true" size={18} />}
      </Button>
    </form>
  )
}
