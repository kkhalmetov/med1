'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { passwordSchema, type PasswordValues } from './schema'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'

export function PasswordForm() {
  const t = useTranslations()
  const [message, setMessage] = useState<string>()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })
  const submit = handleSubmit(async (values) => {
    setMessage(undefined)
    const response = await fetch('/api/auth/password', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (!response.ok) {
      setMessage(t('errors.badRequest'))
      return
    }
    reset()
    setMessage(t('profile.updated'))
  })

  return (
    <Card className="password-card" title={t('auth.changePassword')}>
      <form className="password-form" onSubmit={submit} noValidate>
        <Field
          autoComplete="current-password"
          error={errors.oldPassword ? t('common.required') : undefined}
          label={t('auth.currentPassword')}
          type="password"
          {...register('oldPassword')}
        />
        <Field
          autoComplete="new-password"
          error={errors.newPassword ? t('common.required') : undefined}
          label={t('auth.newPassword')}
          type="password"
          {...register('newPassword')}
        />
        <Field
          autoComplete="new-password"
          error={errors.confirmPassword ? t('auth.invalid') : undefined}
          label={t('auth.confirmPassword')}
          type="password"
          {...register('confirmPassword')}
        />
        {message ? (
          <div className="form-notice" role="status">
            {message}
          </div>
        ) : null}
        <Button loading={isSubmitting} type="submit">
          <KeyRound aria-hidden="true" size={17} />
          {t('common.save')}
        </Button>
      </form>
    </Card>
  )
}
