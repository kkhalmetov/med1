'use client'

import { ChevronDown, Play, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useRef, useState, type FormEvent } from 'react'
import { useSafePolling } from '@/features/chat/polling'
import { apiRequest } from '@/shared/api/client'
import { fetchDownload, saveDownload } from '@/shared/api/download'
import { ApiError } from '@/shared/api/error'
import type { OperationDefinition, OperationField } from '@/shared/api/operation-form'
import { prepareImages } from '@/shared/media/image-pipeline'
import { Button } from './button'

function inputType(field: OperationField) {
  if (field.format === 'date') return 'date'
  if (field.format === 'date-time') return 'datetime-local'
  if (field.format === 'email') return 'email'
  if (field.type === 'number' || field.type === 'integer') return 'number'
  return 'text'
}

function convertValue(field: OperationField, value: FormDataEntryValue) {
  const text = String(value)
  if (field.type === 'boolean') return text === 'true'
  if (field.type === 'integer' || field.type === 'number') return Number(text)
  if (field.type === 'array')
    return text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  return text
}

function replacePath(path: string, fields: OperationField[], data: FormData) {
  return fields
    .filter((field) => field.location === 'path')
    .reduce(
      (result, field) =>
        result.replace(`{${field.name}}`, encodeURIComponent(String(data.get(field.name)))),
      path,
    )
}

function ResultView({ value }: { value: unknown }) {
  const fields = useTranslations('fields')
  const enums = useTranslations('enums')
  const common = useTranslations('common')
  if (value === undefined || value === null || value === '') return <p>{common('empty')}</p>
  if (Array.isArray(value)) {
    if (value.length === 0) return <p>{common('empty')}</p>
    return (
      <div className="result-list">
        {value.map((item, index) => (
          <ResultView
            key={typeof item === 'object' && item && 'id' in item ? String(item.id) : index}
            value={item}
          />
        ))}
      </div>
    )
  }
  if (typeof value === 'object') {
    return (
      <dl className="result-object">
        {Object.entries(value as Record<string, unknown>).map(([key, child]) => (
          <div key={key}>
            <dt>{fields.has(key as never) ? fields(key as never) : key}</dt>
            <dd>
              <ResultView value={child} />
            </dd>
          </div>
        ))}
      </dl>
    )
  }
  if (typeof value === 'boolean') return <span>{value ? common('yes') : common('no')}</span>
  const text = String(value)
  return <span>{enums.has(text as never) ? enums(text as never) : text}</span>
}

function OperationInput({ field }: { field: OperationField }) {
  const labels = useTranslations('fields')
  const enums = useTranslations('enums')
  const workbench = useTranslations('workbench')
  const label = labels.has(field.name as never) ? labels(field.name as never) : field.name
  const id = `operation-field-${field.location}-${field.name}`
  return (
    <label className="operation-field" htmlFor={id}>
      <span>
        {label}
        {field.required ? ' *' : ''}
      </span>
      {field.enum ? (
        <select id={id} name={field.name} required={field.required}>
          {!field.required ? <option value="">—</option> : null}
          {field.enum.map((value) => (
            <option key={value} value={value}>
              {enums(value as never)}
            </option>
          ))}
        </select>
      ) : field.type === 'boolean' ? (
        <select id={id} name={field.name} required={field.required}>
          {!field.required ? <option value="">{workbench('booleanAny')}</option> : null}
          <option value="true">{workbench('booleanTrue')}</option>
          <option value="false">{workbench('booleanFalse')}</option>
        </select>
      ) : field.type === 'file' ? (
        <input
          accept="image/jpeg,image/png,image/webp"
          id={id}
          multiple={field.multiple}
          name={field.name}
          required={field.required}
          type="file"
        />
      ) : (
        <input
          id={id}
          max={field.max}
          min={field.min}
          minLength={field.minLength}
          name={field.name}
          pattern={field.pattern}
          placeholder={field.multiple ? workbench('multipleHint') : undefined}
          required={field.required}
          step={field.type === 'number' ? 'any' : undefined}
          type={inputType(field)}
        />
      )}
    </label>
  )
}

function OperationCard({ operation }: { operation: OperationDefinition }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<unknown>()
  const [error, setError] = useState<string>()
  const formRef = useRef<HTMLFormElement>(null)
  const requestRefresh = useCallback(() => formRef.current?.requestSubmit(), [])
  const historyPolling = ['findAllAsPatient', 'findAllAsPractitionerForPatient'].includes(
    operation.operationId,
  )
  const unreadPolling = ['findUnreadAsPatient', 'findUnreadAsPractitioner'].includes(
    operation.operationId,
  )
  useSafePolling(
    requestRefresh,
    historyPolling ? 10_000 : 30_000,
    open && (historyPolling || unreadPolling),
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(undefined)
    const data = new FormData(event.currentTarget)
    const path = replacePath(operation.path, operation.fields, data)
    const query = Object.fromEntries(
      operation.fields
        .filter((field) => field.location === 'query' && data.get(field.name) !== '')
        .map((field) => [field.name, String(data.get(field.name))]),
    )

    try {
      if (operation.kind === 'download') {
        const search = new URLSearchParams(query).toString()
        saveDownload(
          await fetchDownload(
            `${path}${search ? `?${search}` : ''}`,
            operation.operationId.toLowerCase().includes('pdf')
              ? 'qadam.pdf'
              : operation.operationId.toLowerCase().includes('csv')
                ? 'qadam.csv'
                : 'qadam-file',
          ),
        )
        setResult(t('workbench.downloaded'))
        return
      }

      const bodyFields = operation.fields.filter((field) => field.location === 'body')
      let body: FormData | Record<string, unknown> | undefined
      if (operation.contentType === 'multipart/form-data') {
        body = new FormData()
        for (const field of bodyFields) {
          const values = data.getAll(field.name)
          if (field.type === 'file') {
            const files = values.filter(
              (value): value is File => value instanceof File && value.size > 0,
            )
            for (const file of await prepareImages(files, field.multiple ? 5 : 1)) {
              body.append(field.name, file)
            }
            continue
          }
          for (const value of values) {
            if (String(value) === '') continue
            if (field.multiple && typeof value === 'string') {
              for (const item of value
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean)) {
                body.append(field.name, item)
              }
            } else {
              body.append(field.name, value)
            }
          }
        }
      } else if (bodyFields.length > 0) {
        body = Object.fromEntries(
          bodyFields
            .filter((field) => data.get(field.name) !== '')
            .map((field) => [field.name, convertValue(field, data.get(field.name) ?? '')]),
        )
      }
      const response = await apiRequest(path, {
        method: operation.method,
        query,
        ...(body === undefined ? {} : { body }),
      })
      setResult(response ?? t('workbench.success'))
    } catch (reason) {
      const status = reason instanceof ApiError ? reason.status : 0
      const key =
        status === 400
          ? 'badRequest'
          : status === 401
            ? 'unauthorized'
            : status === 403
              ? 'forbidden'
              : status === 404
                ? 'notFound'
                : status === 409
                  ? 'conflict'
                  : status >= 500
                    ? 'server'
                    : 'generic'
      setError(t(`errors.${key}` as never))
    } finally {
      setPending(false)
    }
  }

  return (
    <article className="operation-card">
      <button
        aria-expanded={open}
        className="operation-card__toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className={`method method--${operation.method.toLowerCase()}`}>
          {operation.method}
        </span>
        <strong>{t(`operations.${operation.operationId}` as never)}</strong>
        <ChevronDown aria-hidden="true" className={open ? 'is-open' : ''} size={19} />
      </button>
      {open ? (
        <form className="operation-card__form" onSubmit={submit} ref={formRef}>
          {operation.fields.length > 0 ? (
            <div className="operation-fields">
              {operation.fields.map((field) => (
                <OperationInput field={field} key={`${field.location}-${field.name}`} />
              ))}
            </div>
          ) : (
            <p className="operation-card__ready">{t('workbench.noData')}</p>
          )}
          {error ? (
            <div className="form-alert" role="alert">
              {error}
            </div>
          ) : null}
          <div className="operation-card__actions">
            <Button loading={pending} type="submit">
              <Play aria-hidden="true" size={16} />
              {pending ? t('workbench.running') : t('workbench.run')}
            </Button>
            <Button
              onClick={() => {
                setResult(undefined)
                setError(undefined)
              }}
              type="reset"
              variant="ghost"
            >
              <RotateCcw aria-hidden="true" size={16} />
              {t('common.cancel')}
            </Button>
          </div>
          {result !== undefined ? (
            <section className="operation-result" aria-live="polite">
              <h3>{t('workbench.result')}</h3>
              <ResultView value={result} />
            </section>
          ) : null}
        </form>
      ) : null}
    </article>
  )
}

export function OperationWorkbench({ definitions }: { definitions: OperationDefinition[] }) {
  return (
    <div className="operation-workbench">
      {definitions.map((operation) => (
        <OperationCard key={operation.operationId} operation={operation} />
      ))}
    </div>
  )
}
