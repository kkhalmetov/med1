'use client'

import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId } from 'react'
import { apiRequest } from '@/shared/api/client'
import { ApiError } from '@/shared/api/error'
import type { components } from '@/shared/api/schema'
import { Button } from '@/shared/ui/button'
import { AsyncNotice } from '@/shared/ui/product-workspace'
import { StatusBadge } from '@/shared/ui/status-badge'

type ShortPatientReview = components['schemas']['ShortPatientReview']

const reviewTones = { GREEN: 'success', YELLOW: 'warning', RED: 'danger' } as const
const reviewStatuses = new Set<NonNullable<ShortPatientReview['statusColor']>>([
  'GREEN',
  'YELLOW',
  'RED',
])

function parseShortPatientReview(value: unknown): ShortPatientReview {
  if (!value || typeof value !== 'object') throw invalidShortReviewResponse()
  const { review, statusColor } = value as Record<string, unknown>
  if (review !== undefined && review !== null && typeof review !== 'string') {
    throw invalidShortReviewResponse()
  }
  if (
    statusColor !== undefined &&
    statusColor !== null &&
    (typeof statusColor !== 'string' ||
      !reviewStatuses.has(statusColor as NonNullable<ShortPatientReview['statusColor']>))
  ) {
    throw invalidShortReviewResponse()
  }
  return {
    ...(typeof review === 'string' ? { review } : {}),
    ...(typeof statusColor === 'string'
      ? { statusColor: statusColor as NonNullable<ShortPatientReview['statusColor']> }
      : {}),
  }
}

function invalidShortReviewResponse() {
  return new ApiError('Invalid short patient review response', {
    status: 502,
    code: 'SERVER_ERROR',
    retryable: false,
  })
}

export function PatientShortReview({ patientId }: { patientId: string }) {
  const t = useTranslations()
  const headingId = useId()
  const query = useQuery({
    queryKey: ['patient', patientId, 'short-review'],
    queryFn: async ({ signal }) =>
      parseShortPatientReview(
        await apiRequest<unknown>(`/patients/${patientId}/short-review`, {
          signal,
          timeoutMs: 65_000,
        }),
      ),
    retry: false,
  })
  const review = query.data?.review?.trim()
  const errorLabel = (() => {
    if (!(query.error instanceof ApiError)) return t('errors.generic')
    if (query.error.code === 'NOT_FOUND') return t('patientReview.notFound')
    if (query.error.code === 'FORBIDDEN') return t('errors.forbidden')
    if (query.error.code === 'TIMEOUT') return t('patientReview.timeout')
    if (query.error.code === 'NETWORK' || query.error.code === 'SERVER_ERROR') {
      return t('patientReview.unavailable')
    }
    return t('errors.generic')
  })()

  return (
    <section aria-labelledby={headingId} className="patient-review">
      <header className="patient-review__header">
        <div>
          <div className="patient-review__title">
            <Sparkles aria-hidden="true" size={19} />
            <h3 id={headingId}>{t('patientReview.title')}</h3>
          </div>
          <p>{t('patientReview.description')}</p>
        </div>
        {!query.isError ? (
          <Button
            aria-label={t('patientReview.refresh')}
            loading={query.isFetching}
            onClick={() => query.refetch()}
            size="compact"
            variant="secondary"
          >
            {t('patientReview.refresh')}
          </Button>
        ) : null}
      </header>
      <AsyncNotice
        loading={query.isLoading}
        error={query.isError}
        empty={!review}
        loadingLabel={t('patientReview.loading')}
        errorLabel={errorLabel}
        emptyLabel={t('patientReview.empty')}
      />
      {query.isError ? (
        <div className="patient-review__retry">
          <Button onClick={() => query.refetch()} size="compact" variant="secondary">
            {t('common.retry')}
          </Button>
        </div>
      ) : null}
      {review ? (
        <div className="patient-review__content">
          {query.data?.statusColor ? (
            <StatusBadge tone={reviewTones[query.data.statusColor]}>
              {t(`enums.${query.data.statusColor}` as never)}
            </StatusBadge>
          ) : null}
          <p>{review}</p>
        </div>
      ) : null}
      <p className="patient-review__note">{t('patientReview.note')}</p>
    </section>
  )
}
