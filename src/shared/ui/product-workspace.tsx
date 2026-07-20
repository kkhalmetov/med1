'use client'

import { AlertCircle, ChevronRight, LoaderCircle, X } from 'lucide-react'
import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Button } from './button'

export function ProductPage({
  eyebrow = 'Qadam',
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string | undefined
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="dashboard-page product-page">
      <header className="page-heading product-page__heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="product-page__actions">{actions}</div> : null}
      </header>
      {children}
    </div>
  )
}

export function ProductPanel({
  title,
  description,
  action,
  className = '',
  children,
}: {
  title?: string | undefined
  description?: string | undefined
  action?: ReactNode | undefined
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`card product-panel ${className}`.trim()}>
      {title || description || action ? (
        <header className="product-panel__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {action ? <div className="product-panel__action">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function ActionPanel({
  open,
  title,
  description,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean
  title: string
  description?: string | undefined
  closeLabel: string
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <section className="action-panel" aria-label={title}>
      <header>
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <button aria-label={closeLabel} className="icon-button" onClick={onClose} type="button">
          <X aria-hidden="true" size={20} />
        </button>
      </header>
      {children}
    </section>
  )
}

export function ProductForm({
  onSubmit,
  children,
  className = '',
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  children: ReactNode
  className?: string
}) {
  return (
    <form className={`product-form ${className}`.trim()} noValidate onSubmit={onSubmit}>
      {children}
    </form>
  )
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="product-form__grid">{children}</div>
}

export function InputField({
  label,
  hint,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string | undefined }) {
  return (
    <label className={`product-field ${className}`.trim()}>
      <span>{label}</span>
      <input {...props} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function SelectField({
  label,
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className={`product-field ${className}`.trim()}>
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  )
}

export function TextareaField({
  label,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={`product-field ${className}`.trim()}>
      <span>{label}</span>
      <textarea {...props} />
    </label>
  )
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="product-form__actions">{children}</div>
}

export function AsyncNotice({
  loading,
  error,
  empty,
  loadingLabel,
  errorLabel,
  emptyLabel,
}: {
  loading?: boolean
  error?: boolean
  empty?: boolean
  loadingLabel: string
  errorLabel: string
  emptyLabel: string
}) {
  if (loading)
    return (
      <div className="product-notice" role="status">
        <LoaderCircle aria-hidden="true" className="spin" size={19} /> {loadingLabel}
      </div>
    )
  if (error)
    return (
      <div className="product-notice product-notice--error" role="alert">
        <AlertCircle aria-hidden="true" size={19} /> {errorLabel}
      </div>
    )
  if (empty) return <div className="product-notice">{emptyLabel}</div>
  return null
}

export function ActionMessage({
  message,
  error,
}: {
  message?: string | undefined
  error?: string | undefined
}) {
  if (error)
    return (
      <div className="form-alert" role="alert">
        {error}
      </div>
    )
  if (message)
    return (
      <div className="form-notice" role="status">
        {message}
      </div>
    )
  return null
}

export function EntityGrid({ children }: { children: ReactNode }) {
  return <div className="entity-grid">{children}</div>
}

export function EntityCard({
  title,
  meta,
  detail,
  badge,
  selected,
  onClick,
}: {
  title: string
  meta?: string | undefined
  detail?: string | undefined
  badge?: ReactNode | undefined
  selected?: boolean | undefined
  onClick?: (() => void) | undefined
}) {
  const content = (
    <>
      <span className="entity-card__copy">
        <strong>{title}</strong>
        {meta ? <span>{meta}</span> : null}
        {detail ? <small>{detail}</small> : null}
      </span>
      {badge}
      {onClick ? <ChevronRight aria-hidden="true" size={19} /> : null}
    </>
  )
  return onClick ? (
    <button aria-pressed={selected} className="entity-card" onClick={onClick} type="button">
      {content}
    </button>
  ) : (
    <article className="entity-card">{content}</article>
  )
}

export function DetailList({ entries }: { entries: Array<[string, ReactNode]> }) {
  return (
    <dl className="detail-list">
      {entries.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <div className="segmented" aria-label={label} role="group">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function useActionState() {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  async function run(action: () => Promise<void>, successMessage: string, errorMessage: string) {
    setPending(true)
    setMessage(undefined)
    setError(undefined)
    try {
      await action()
      setMessage(successMessage)
      return true
    } catch {
      setError(errorMessage)
      return false
    } finally {
      setPending(false)
    }
  }

  return { pending, message, error, run, clear: () => (setMessage(undefined), setError(undefined)) }
}

export function SubmitButton({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean
  label: string
  pendingLabel: string
}) {
  return (
    <Button loading={pending} type="submit">
      {pending ? pendingLabel : label}
    </Button>
  )
}

export function formValue(form: FormData, name: string) {
  return String(form.get(name) ?? '').trim()
}

export function optionalValue(form: FormData, name: string) {
  const value = formValue(form, name)
  return value || undefined
}

export function numberValue(form: FormData, name: string) {
  const value = formValue(form, name)
  return value === '' ? undefined : Number(value)
}

export function formatDate(value: string | null | undefined, locale = 'ru-KZ') {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export function fullName(value: { firstName?: string; lastName?: string; middleName?: string }) {
  return [value.lastName, value.firstName, value.middleName].filter(Boolean).join(' ') || '—'
}
