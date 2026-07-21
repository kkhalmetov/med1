'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { components } from '@/shared/api/schema'
import { ProtectedImage } from '@/shared/ui/protected-image'

type Message = components['schemas']['ChatMessageResponse']

function formatMessageTimestamp(value: string | undefined, formatter: Intl.DateTimeFormat) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return formatter.format(date)
}

export function MessageThread({
  messages,
  ownSenderType,
  locale,
  label,
  photoLabel,
}: {
  messages: Message[]
  ownSenderType: 'PATIENT' | 'PRACTITIONER'
  locale: string
  label: string
  photoLabel: string
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const latestMessageId = messages.at(-1)?.id
  const timestampFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }),
    [locale],
  )

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const scrollToLatest = () => {
      list.scrollTop = list.scrollHeight
    }
    scrollToLatest()
    const frame = requestAnimationFrame(scrollToLatest)
    const observer = new ResizeObserver(scrollToLatest)
    observer.observe(list)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [latestMessageId])

  return (
    <div
      aria-label={label}
      aria-live="polite"
      aria-relevant="additions text"
      className="message-list"
      ref={listRef}
      role="log"
    >
      {messages.map((message) => (
        <article
          className={`message-bubble ${message.senderType === ownSenderType ? 'message-bubble--own' : ''}`}
          key={message.id}
        >
          {message.imageUrl ? (
            <ProtectedImage
              alt={photoLabel}
              height={180}
              width={260}
              src={`/api/backend/files?path=${encodeURIComponent(message.imageUrl)}`}
            />
          ) : null}
          {message.content ? <p>{message.content}</p> : null}
          <small>{formatMessageTimestamp(message.sentAt, timestampFormatter)}</small>
        </article>
      ))}
    </div>
  )
}
