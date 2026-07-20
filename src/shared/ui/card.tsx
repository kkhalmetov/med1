import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string
  title?: string
  action?: ReactNode
}

export function Card({ eyebrow, title, action, className = '', children, ...props }: CardProps) {
  return (
    <section {...props} className={`card ${className}`.trim()}>
      {eyebrow || title || action ? (
        <header className="card__header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="card__title">{title}</h2> : null}
          </div>
          {action ? <div className="card__action">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
