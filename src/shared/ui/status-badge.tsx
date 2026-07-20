import { CircleAlert, CircleCheck, Clock3, Info } from 'lucide-react'
import type { HTMLAttributes } from 'react'

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const icons = {
  success: CircleCheck,
  warning: Clock3,
  danger: CircleAlert,
  info: Info,
  neutral: Info,
}

export function StatusBadge({
  tone = 'neutral',
  className = '',
  children,
  ...props
}: StatusBadgeProps) {
  const Icon = icons[tone]
  return (
    <span {...props} className={`status-badge ${className}`.trim()} data-tone={tone} role="status">
      <Icon aria-hidden="true" size={15} strokeWidth={2.4} />
      <span>{children}</span>
    </span>
  )
}
