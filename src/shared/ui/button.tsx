import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'default' | 'compact'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`button button--${variant} button--${size} ${className}`.trim()}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <span className="button__spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  )
}
