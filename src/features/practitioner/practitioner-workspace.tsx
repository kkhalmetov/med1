'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Download, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { PasswordForm } from '@/features/auth/password-form'
import { useSafePolling } from '@/features/chat/polling'
import { apiRequest } from '@/shared/api/client'
import { fetchDownload, saveDownload } from '@/shared/api/download'
import { ApiError } from '@/shared/api/error'
import type { components } from '@/shared/api/schema'
import { useApiQuery } from '@/shared/api/use-api-query'
import { prepareImages } from '@/shared/media/image-pipeline'
import { Button } from '@/shared/ui/button'
import { ProtectedImage } from '@/shared/ui/protected-image'
import {
  ActionMessage,
  ActionPanel,
  AsyncNotice,
  DetailList,
  EntityCard,
  EntityGrid,
  FileField,
  FormActions,
  FormGrid,
  formatDate,
  formValue,
  fullName,
  InputField,
  numberValue,
  optionalValue,
  ProductForm,
  ProductPage,
  ProductPanel,
  SegmentedControl,
  SelectField,
  SubmitButton,
  TextareaField,
  useActionState,
} from '@/shared/ui/product-workspace'
import { StatusBadge } from '@/shared/ui/status-badge'

type Patient = components['schemas']['PatientResponse']
type Practitioner = components['schemas']['PractitionerResponse']
type Report = components['schemas']['QuestionnaireResponseResponse']
type Complaint = components['schemas']['DeviceComplainResponse']
type StatusChange = components['schemas']['PatientStatusChangeResponse']
type Message = components['schemas']['ChatMessageResponse']
type Device = components['schemas']['DeviceResponse']
type Dispense = components['schemas']['DeviceDispenseResponse']
type Organization = components['schemas']['OrganizationResponse']

const patientTones = { GREEN: 'success', YELLOW: 'warning', RED: 'danger' } as const

function common(t: ReturnType<typeof useTranslations>) {
  return { loading: t('common.loading'), error: t('errors.generic'), empty: t('common.empty') }
}

function apiActionError(error: unknown, t: ReturnType<typeof useTranslations>) {
  if (!(error instanceof ApiError)) return t('errors.generic')
  if (error.code === 'UNAUTHORIZED') return t('errors.unauthorized')
  if (error.code === 'FORBIDDEN') return t('errors.forbidden')
  if (error.code === 'NOT_FOUND') return t('errors.notFound')
  if (error.code === 'BAD_REQUEST') return t('errors.badRequest')
  if (error.code === 'CONFLICT') return t('errors.conflict')
  if (error.code === 'TIMEOUT') return t('errors.timeout')
  if (error.code === 'SERVER_ERROR' || error.code === 'NETWORK') return t('errors.server')
  return t('errors.generic')
}

async function download(path: string, filename: string) {
  saveDownload(await fetchDownload(path, filename))
}

function PatientRegistration({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations()
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const ok = await action.run(
      async () => {
        const body = new FormData()
        for (const name of [
          'iin',
          'firstName',
          'lastName',
          'middleName',
          'birthDate',
          'gender',
          'email',
          'phone',
          'city',
          'address',
          'disabledGroup',
        ]) {
          const value = optionalValue(data, name)
          if (value) body.set(name, value)
        }
        const photo = data.get('photo')
        if (photo instanceof File && photo.size > 0) {
          const [prepared] = await prepareImages([photo], 1)
          if (prepared) body.set('photo', prepared)
        }
        await apiRequest('/patients', { method: 'POST', body })
      },
      t('practitioner.patientCreated'),
      t('errors.badRequest'),
    )
    if (ok) {
      target.reset()
      onCreated()
    }
  }
  return (
    <ProductForm onSubmit={submit}>
      <FormGrid>
        <InputField label={t('fields.lastName')} name="lastName" required />
        <InputField label={t('fields.firstName')} name="firstName" required />
        <InputField label={t('fields.middleName')} name="middleName" />
        <InputField label={t('fields.iin')} name="iin" required />
        <InputField label={t('fields.birthDate')} name="birthDate" required type="date" />
        <SelectField label={t('fields.gender')} name="gender" required>
          <option value="">—</option>
          {['MALE', 'FEMALE', 'OTHER'].map((value) => (
            <option key={value} value={value}>
              {t(`enums.${value}` as never)}
            </option>
          ))}
        </SelectField>
        <InputField label={t('fields.email')} name="email" required type="email" />
        <InputField label={t('fields.phone')} name="phone" required type="tel" />
        <InputField label={t('fields.city')} name="city" required />
        <InputField label={t('fields.address')} name="address" required />
        <SelectField label={t('fields.disabledGroup')} name="disabledGroup">
          <option value="">—</option>
          {['FIRST', 'SECOND', 'THIRD'].map((value) => (
            <option key={value} value={value}>
              {t(`enums.${value}` as never)}
            </option>
          ))}
        </SelectField>
        <FileField
          accept="image/*"
          chooseLabel={t('common.choosePhoto')}
          emptyLabel={t('common.noFileSelected')}
          label={t('fields.photo')}
          name="photo"
        />
      </FormGrid>
      <ActionMessage error={action.error} message={action.message} />
      <FormActions>
        <SubmitButton
          pending={action.pending}
          label={t('patients.new')}
          pendingLabel={t('common.saving')}
        />
      </FormActions>
    </ProductForm>
  )
}

function PatientStatusCard({ patient, onChanged }: { patient: Patient; onChanged: () => void }) {
  const t = useTranslations()
  const locale = useLocale()
  const action = useActionState()
  const history = useApiQuery<StatusChange[]>(
    ['patient', patient.id, 'status-history'],
    `/patients/${patient.id}/status-history`,
  )
  const historyErrorLabel =
    history.error instanceof ApiError &&
    (history.error.code === 'SERVER_ERROR' || history.error.code === 'NETWORK')
      ? t('practitioner.statusHistoryUnavailable')
      : apiActionError(history.error, t)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const ok = await action.run(
      async () => {
        await apiRequest(`/patients/${patient.id}/status`, {
          method: 'PATCH',
          body: { status: formValue(data, 'status'), comment: optionalValue(data, 'comment') },
        })
      },
      t('practitioner.statusChanged'),
      t('errors.badRequest'),
    )
    if (ok) {
      await history.refetch()
      onChanged()
    }
  }
  return (
    <ProductPanel title={fullName(patient)} description={t('patients.profile')}>
      <DetailList
        entries={[
          [
            t('patients.status'),
            patient.status ? (
              <StatusBadge tone={patientTones[patient.status]}>
                {t(`enums.${patient.status}` as never)}
              </StatusBadge>
            ) : (
              '—'
            ),
          ],
          [t('fields.phone'), patient.phone],
          [t('fields.email'), patient.email],
          [t('fields.city'), patient.city],
          [t('fields.address'), patient.address],
          [
            t('fields.disabledGroup'),
            patient.disabledGroup ? t(`enums.${patient.disabledGroup}` as never) : '—',
          ],
        ]}
      />
      <ProductForm onSubmit={submit}>
        <FormGrid>
          <SelectField
            defaultValue={patient.status}
            label={t('patients.changeStatus')}
            name="status"
            required
          >
            {['GREEN', 'YELLOW', 'RED'].map((value) => (
              <option key={value} value={value}>
                {t(`enums.${value}` as never)}
              </option>
            ))}
          </SelectField>
          <InputField label={t('fields.comment')} name="comment" />
        </FormGrid>
        <ActionMessage error={action.error} message={action.message} />
        <FormActions>
          <SubmitButton
            pending={action.pending}
            label={t('patients.changeStatus')}
            pendingLabel={t('common.saving')}
          />
        </FormActions>
      </ProductForm>
      <h3>{t('patients.statusHistory')}</h3>
      <AsyncNotice
        loading={history.isLoading}
        error={history.isError}
        empty={!history.data?.length}
        loadingLabel={t('common.loading')}
        errorLabel={historyErrorLabel}
        emptyLabel={t('common.empty')}
      />
      {history.data?.length ? (
        <EntityGrid>
          {history.data.map((item) => (
            <EntityCard
              key={item.id}
              title={item.status ? t(`enums.${item.status}` as never) : t('patients.status')}
              meta={item.changedByFullName}
              detail={`${formatDate(item.changedAt, locale)}${item.comment ? ` · ${item.comment}` : ''}`}
            />
          ))}
        </EntityGrid>
      ) : null}
    </ProductPanel>
  )
}

function PractitionerPatients() {
  const t = useTranslations()
  const labels = common(t)
  const [view, setView] = useState('active')
  const [selected, setSelected] = useState<Patient>()
  const [createOpen, setCreateOpen] = useState(false)
  const patients = useApiQuery<Patient[]>(['practitioner', 'patients', view], '/patients', {
    query: { only_observable: view === 'active' },
  })
  return (
    <ProductPage
      title={t('patients.title')}
      description={t('practitioner.patientsDescription')}
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" size={18} /> {t('patients.new')}
        </Button>
      }
    >
      <ActionPanel
        open={createOpen}
        title={t('patients.new')}
        closeLabel={t('common.close')}
        onClose={() => setCreateOpen(false)}
      >
        <PatientRegistration onCreated={() => patients.refetch()} />
      </ActionPanel>
      <SegmentedControl
        label={t('common.filter')}
        value={view}
        onChange={setView}
        options={[
          { value: 'active', label: t('patients.observableOnly') },
          { value: 'all', label: t('common.all') },
        ]}
      />
      <div className="product-layout">
        <ProductPanel title={t('practitioner.patientRegistry')}>
          <AsyncNotice
            loading={patients.isLoading}
            error={patients.isError}
            empty={!patients.data?.length}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {patients.data?.length ? (
            <EntityGrid>
              {patients.data.map((patient) => (
                <EntityCard
                  key={patient.id}
                  title={fullName(patient)}
                  meta={patient.phone}
                  detail={patient.currentDevices?.map((item) => item.deviceName).join(', ')}
                  badge={
                    patient.status ? (
                      <StatusBadge tone={patientTones[patient.status]}>
                        {t(`enums.${patient.status}` as never)}
                      </StatusBadge>
                    ) : null
                  }
                  selected={selected?.id === patient.id}
                  onClick={() => setSelected(patient)}
                />
              ))}
            </EntityGrid>
          ) : null}
        </ProductPanel>
        {selected ? (
          <PatientStatusCard patient={selected} onChanged={() => patients.refetch()} />
        ) : (
          <ProductPanel title={t('patients.profile')}>
            <AsyncNotice
              empty
              emptyLabel={t('practitioner.choosePatient')}
              loadingLabel={labels.loading}
              errorLabel={labels.error}
            />
          </ProductPanel>
        )}
      </div>
    </ProductPage>
  )
}

function PractitionerReports() {
  const t = useTranslations()
  const locale = useLocale()
  const labels = common(t)
  const [filter, setFilter] = useState('unchecked')
  const [selected, setSelected] = useState<Report>()
  const action = useActionState()
  const reports = useApiQuery<Report[]>(['practitioner', 'reports', filter], '/reports', {
    query: { is_unchecked: filter === 'unchecked' },
  })
  const patientReports = selected?.patientId ? (
    <PatientReportHistory patientId={selected.patientId} unchecked={filter === 'unchecked'} />
  ) : null
  async function check() {
    if (!selected?.id) return
    const ok = await action.run(
      async () => {
        const checked = await apiRequest<Report>(`/reports/${selected.id}/check`, {
          method: 'PATCH',
        })
        setSelected((current) => (current ? { ...current, ...checked } : checked))
      },
      t('practitioner.reportChecked'),
      (error) => apiActionError(error, t),
    )
    if (ok) await reports.refetch()
  }
  async function exportPdf() {
    if (!selected?.patientId) return
    await action.run(
      () => download(`/patients/${selected.patientId}/reports/export-pdf`, 'qadam-reports.pdf'),
      t('practitioner.downloadReady'),
      (error) => apiActionError(error, t),
    )
  }
  return (
    <ProductPage
      title={t('practitioner.patientReports')}
      description={t('practitioner.reportsDescription')}
    >
      <SegmentedControl
        label={t('common.filter')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'unchecked', label: t('reports.unchecked') },
          { value: 'all', label: t('common.all') },
        ]}
      />
      <div className="product-layout">
        <ProductPanel title={t('operations.findAllMyPatientsReports')}>
          <AsyncNotice
            loading={reports.isLoading}
            error={reports.isError}
            empty={!reports.data?.length}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {reports.data?.length ? (
            <EntityGrid>
              {reports.data.map((report) => (
                <EntityCard
                  key={report.id}
                  title={report.patientFullName || t('patients.profile')}
                  meta={report.deviceName}
                  detail={`${formatDate(report.submittedAt, locale)} · ${t('reports.pain')}: ${report.painLevel ?? '—'}`}
                  badge={
                    <StatusBadge tone={report.checkedAt ? 'success' : 'warning'}>
                      {report.checkedAt ? t('reports.checked') : t('reports.unchecked')}
                    </StatusBadge>
                  }
                  selected={selected?.id === report.id}
                  onClick={() => setSelected(report)}
                />
              ))}
            </EntityGrid>
          ) : null}
        </ProductPanel>
        <ProductPanel title={selected?.patientFullName || t('practitioner.reportCard')}>
          {selected ? (
            <>
              <div className="report-review">
                <DetailList
                  entries={[
                    [t('reports.pain'), selected.painLevel],
                    [t('reports.discomfort'), selected.discomfortLevel],
                    [t('reports.mobility'), selected.mobilityLevel],
                    [t('reports.sleep'), selected.sleepQuality],
                    [t('reports.comment'), selected.comment],
                    [t('fields.issuedAt'), formatDate(selected.submittedAt, locale)],
                  ]}
                />
                <div className="toolbar">
                  <Button disabled={action.pending || Boolean(selected.checkedAt)} onClick={check}>
                    {t('reports.markChecked')}
                  </Button>
                  <Button disabled={action.pending} onClick={exportPdf} variant="secondary">
                    <Download aria-hidden="true" size={17} /> {t('practitioner.downloadPdf')}
                  </Button>
                </div>
                <ActionMessage error={action.error} message={action.message} />
              </div>
              {patientReports}
            </>
          ) : (
            <AsyncNotice
              empty
              emptyLabel={t('practitioner.chooseReport')}
              loadingLabel={labels.loading}
              errorLabel={labels.error}
            />
          )}
        </ProductPanel>
      </div>
    </ProductPage>
  )
}

function PatientReportHistory({ patientId, unchecked }: { patientId: string; unchecked: boolean }) {
  const t = useTranslations()
  const locale = useLocale()
  const reports = useApiQuery<Report[]>(
    ['patient', patientId, 'reports', unchecked],
    `/patients/${patientId}/reports`,
    { query: { is_unchecked: unchecked } },
  )
  return (
    <div className="report-history">
      <h3>{t('reports.history')}</h3>
      <AsyncNotice
        loading={reports.isLoading}
        error={reports.isError}
        empty={!reports.data?.length}
        loadingLabel={t('common.loading')}
        errorLabel={t('errors.generic')}
        emptyLabel={t('common.empty')}
      />
      {reports.data?.length ? (
        <EntityGrid>
          {reports.data.map((report) => (
            <EntityCard
              key={report.id}
              title={report.deviceName || t('devices.title')}
              meta={`${t('reports.pain')}: ${report.painLevel ?? '—'} · ${t('reports.discomfort')}: ${report.discomfortLevel ?? '—'}`}
              detail={formatDate(report.submittedAt, locale)}
              badge={
                <StatusBadge tone={report.checkedAt ? 'success' : 'warning'}>
                  {report.checkedAt ? t('reports.checked') : t('reports.unchecked')}
                </StatusBadge>
              }
            />
          ))}
        </EntityGrid>
      ) : null}
    </div>
  )
}

function ComplaintReview({
  complaint,
  onReviewed,
}: {
  complaint: Complaint
  onReviewed: () => void
}) {
  const t = useTranslations()
  const locale = useLocale()
  const action = useActionState()
  const detail = useApiQuery<Complaint>(
    ['complaint', complaint.id],
    `/device-complains/${complaint.id}`,
  )
  const value = detail.data ?? complaint
  const patientComplaints = useApiQuery<Complaint[]>(
    ['patient', complaint.patientId, 'complaints'],
    `/patients/${complaint.patientId}/device-complains`,
    { query: { not_reviewed: false } },
  )
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const ok = await action.run(
      async () => {
        await apiRequest(`/device-complains/${complaint.id}/review`, {
          method: 'PATCH',
          body: {
            status: formValue(data, 'status'),
            reviewDecision: formValue(data, 'reviewDecision'),
          },
        })
      },
      t('practitioner.complaintReviewed'),
      t('errors.badRequest'),
    )
    if (ok) onReviewed()
  }
  async function exportPdf() {
    await action.run(
      () =>
        download(
          `/patients/${complaint.patientId}/device-complains/export-pdf`,
          'qadam-complaints.pdf',
        ),
      t('practitioner.downloadReady'),
      t('errors.generic'),
    )
  }
  return (
    <ProductPanel title={value.patientFullName || t('practitioner.complaintCard')}>
      <DetailList
        entries={[
          [t('fields.deviceId'), value.deviceName],
          [t('complaints.reason'), value.reason ? t(`enums.${value.reason}` as never) : '—'],
          [t('fields.comment'), value.comment],
          [t('fields.status'), value.status ? t(`enums.${value.status}` as never) : '—'],
          [t('fields.issuedAt'), formatDate(value.createdAt, locale)],
          [t('complaints.resolution'), value.reviewDecision],
        ]}
      />
      {value.photos?.length ? (
        <div className="photo-grid">
          {value.photos.map((photo) => (
            <ProtectedImage
              alt={t('complaints.photos')}
              height={140}
              key={photo.id}
              src={`/api/backend/files?path=${encodeURIComponent(photo.imagePath ?? '')}`}
              width={180}
            />
          ))}
        </div>
      ) : null}
      <ProductForm onSubmit={submit}>
        <FormGrid>
          <SelectField
            defaultValue={value.status ?? 'IN_REVIEW'}
            label={t('fields.status')}
            name="status"
            required
          >
            {['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
              <option key={status} value={status}>
                {t(`enums.${status}` as never)}
              </option>
            ))}
          </SelectField>
          <TextareaField label={t('complaints.resolution')} name="reviewDecision" required />
        </FormGrid>
        <ActionMessage error={action.error} message={action.message} />
        <FormActions>
          <SubmitButton
            pending={action.pending}
            label={t('complaints.review')}
            pendingLabel={t('common.saving')}
          />
          <Button onClick={exportPdf} type="button" variant="secondary">
            <Download aria-hidden="true" size={17} /> {t('practitioner.downloadPdf')}
          </Button>
        </FormActions>
      </ProductForm>
      <h3>
        {t('practitioner.patientComplaintCount', { count: patientComplaints.data?.length ?? 0 })}
      </h3>
      {patientComplaints.data?.length ? (
        <EntityGrid>
          {patientComplaints.data.map((item) => (
            <EntityCard
              key={item.id}
              title={item.deviceName || t('complaints.title')}
              meta={item.reason ? t(`enums.${item.reason}` as never) : undefined}
              detail={formatDate(item.createdAt, locale)}
              badge={
                item.status ? (
                  <StatusBadge
                    tone={
                      item.status === 'REJECTED'
                        ? 'danger'
                        : item.status === 'APPROVED' || item.status === 'COMPLETED'
                          ? 'success'
                          : 'warning'
                    }
                  >
                    {t(`enums.${item.status}` as never)}
                  </StatusBadge>
                ) : null
              }
            />
          ))}
        </EntityGrid>
      ) : null}
    </ProductPanel>
  )
}

function PractitionerComplaints() {
  const t = useTranslations()
  const locale = useLocale()
  const labels = common(t)
  const [filter, setFilter] = useState('new')
  const [selected, setSelected] = useState<Complaint>()
  const complaints = useApiQuery<Complaint[]>(
    ['practitioner', 'complaints', filter],
    '/device-complains',
    { query: { not_reviewed: filter === 'new' } },
  )
  return (
    <ProductPage
      title={t('practitioner.patientComplaints')}
      description={t('practitioner.complaintsDescription')}
    >
      <SegmentedControl
        label={t('common.filter')}
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'new', label: t('dashboard.newComplaints') },
          { value: 'all', label: t('common.all') },
        ]}
      />
      <div className="product-layout">
        <ProductPanel title={t('operations.findAllMyPatientsComplaints')}>
          <AsyncNotice
            loading={complaints.isLoading}
            error={complaints.isError}
            empty={!complaints.data?.length}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {complaints.data?.length ? (
            <EntityGrid>
              {complaints.data.map((complaint) => (
                <EntityCard
                  key={complaint.id}
                  title={complaint.patientFullName || t('patients.profile')}
                  meta={complaint.deviceName}
                  detail={formatDate(complaint.createdAt, locale)}
                  badge={
                    complaint.status ? (
                      <StatusBadge
                        tone={
                          complaint.status === 'REJECTED'
                            ? 'danger'
                            : complaint.status === 'COMPLETED' || complaint.status === 'APPROVED'
                              ? 'success'
                              : 'warning'
                        }
                      >
                        {t(`enums.${complaint.status}` as never)}
                      </StatusBadge>
                    ) : null
                  }
                  selected={selected?.id === complaint.id}
                  onClick={() => setSelected(complaint)}
                />
              ))}
            </EntityGrid>
          ) : null}
        </ProductPanel>
        {selected ? (
          <ComplaintReview complaint={selected} onReviewed={() => complaints.refetch()} />
        ) : (
          <ProductPanel title={t('practitioner.complaintCard')}>
            <AsyncNotice
              empty
              emptyLabel={t('practitioner.chooseComplaint')}
              loadingLabel={labels.loading}
              errorLabel={labels.error}
            />
          </ProductPanel>
        )}
      </div>
    </ProductPage>
  )
}

function PractitionerChatPanel({ patient }: { patient: Patient }) {
  const t = useTranslations()
  const locale = useLocale()
  const action = useActionState()
  const messages = useApiQuery<Message[]>(
    ['practitioner', 'chat', patient.id],
    `/patients/${patient.id}/chat/messages`,
  )
  useSafePolling(() => messages.refetch(), 10_000, true)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const photo = data.get('photo')
    const ok = await action.run(
      async () => {
        if (photo instanceof File && photo.size > 0) {
          const body = new FormData()
          const [prepared] = await prepareImages([photo], 1)
          if (prepared) body.set('photo', prepared)
          const content = optionalValue(data, 'content')
          if (content) body.set('content', content)
          await apiRequest(`/patients/${patient.id}/chat/messages/photo`, { method: 'POST', body })
        } else
          await apiRequest(`/patients/${patient.id}/chat/messages`, {
            method: 'POST',
            body: { content: formValue(data, 'content') },
          })
      },
      t('product.messageSent'),
      t('errors.badRequest'),
    )
    if (ok) {
      target.reset()
      await messages.refetch()
    }
  }
  return (
    <ProductPanel title={fullName(patient)}>
      <AsyncNotice
        loading={messages.isLoading}
        error={messages.isError}
        empty={!messages.data?.length}
        loadingLabel={t('common.loading')}
        errorLabel={t('errors.generic')}
        emptyLabel={t('chat.empty')}
      />
      {messages.data?.length ? (
        <div className="message-list">
          {messages.data.map((message) => (
            <article
              className={`message-bubble ${message.senderType === 'PRACTITIONER' ? 'message-bubble--own' : ''}`}
              key={message.id}
            >
              {message.imageUrl ? (
                <ProtectedImage
                  alt={t('chat.photo')}
                  height={180}
                  src={`/api/backend/files?path=${encodeURIComponent(message.imageUrl)}`}
                  width={260}
                />
              ) : null}
              <p>{message.content}</p>
              <small>{formatDate(message.sentAt, locale)}</small>
            </article>
          ))}
        </div>
      ) : null}
      <ProductForm onSubmit={submit}>
        <TextareaField label={t('chat.message')} name="content" />
        <FileField
          accept="image/*"
          chooseLabel={t('common.choosePhoto')}
          emptyLabel={t('common.noFileSelected')}
          label={t('chat.photo')}
          name="photo"
        />
        <ActionMessage error={action.error} message={action.message} />
        <FormActions>
          <SubmitButton
            pending={action.pending}
            label={t('common.send')}
            pendingLabel={t('common.sending')}
          />
        </FormActions>
      </ProductForm>
    </ProductPanel>
  )
}

function PractitionerChat() {
  const t = useTranslations()
  const labels = common(t)
  const [selected, setSelected] = useState<Patient>()
  const patients = useApiQuery<Patient[]>(['practitioner', 'patients', 'chat'], '/patients', {
    query: { only_observable: true },
  })
  const unread = useApiQuery<unknown[]>(['practitioner', 'chat', 'unread'], '/chat/unread')
  useSafePolling(() => unread.refetch(), 30_000, true)
  return (
    <ProductPage title={t('nav.chat')} description={t('practitioner.chatDescription')}>
      <div className="product-layout">
        <ProductPanel
          title={t('practitioner.choosePatient')}
          action={
            unread.data?.length ? <StatusBadge tone="info">{unread.data.length}</StatusBadge> : null
          }
        >
          <AsyncNotice
            loading={patients.isLoading}
            error={patients.isError}
            empty={!patients.data?.length}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {patients.data?.length ? (
            <EntityGrid>
              {patients.data.map((patient) => (
                <EntityCard
                  key={patient.id}
                  title={fullName(patient)}
                  meta={patient.phone}
                  selected={selected?.id === patient.id}
                  onClick={() => setSelected(patient)}
                />
              ))}
            </EntityGrid>
          ) : null}
        </ProductPanel>
        {selected ? (
          <PractitionerChatPanel patient={selected} />
        ) : (
          <ProductPanel title={t('chat.message')}>
            <AsyncNotice
              empty
              emptyLabel={t('practitioner.choosePatient')}
              loadingLabel={labels.loading}
              errorLabel={labels.error}
            />
          </ProductPanel>
        )}
      </div>
    </ProductPage>
  )
}

function DeviceCreateForm({
  organizations,
  onCreated,
}: {
  organizations: Organization[]
  onCreated: () => void
}) {
  const t = useTranslations()
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const ok = await action.run(
      async () => {
        await apiRequest('/devices', {
          method: 'POST',
          body: {
            type: formValue(data, 'type'),
            name: formValue(data, 'name'),
            code: optionalValue(data, 'code'),
            targetBodyPart: formValue(data, 'targetBodyPart'),
            expectedYears: numberValue(data, 'expectedYears') ?? 0,
            expectedMonths: numberValue(data, 'expectedMonths') ?? 0,
            expectedDays: numberValue(data, 'expectedDays') ?? 0,
            description: optionalValue(data, 'description'),
            manufacturer: formValue(data, 'manufacturer'),
            organizationId: formValue(data, 'organizationId'),
          },
        })
      },
      t('practitioner.deviceCreated'),
      t('errors.badRequest'),
    )
    if (ok) {
      target.reset()
      onCreated()
    }
  }
  return (
    <ProductForm onSubmit={submit}>
      <FormGrid>
        <SelectField label={t('fields.type')} name="type" required>
          {['PROSTHESIS', 'ORTHOSIS'].map((v) => (
            <option key={v} value={v}>
              {t(`enums.${v}` as never)}
            </option>
          ))}
        </SelectField>
        <InputField label={t('fields.name')} name="name" required />
        <InputField label={t('fields.code')} name="code" />
        <SelectField label={t('fields.targetBodyPart')} name="targetBodyPart" required>
          {['ARM', 'LEG', 'BACK', 'NECK'].map((v) => (
            <option key={v} value={v}>
              {t(`enums.${v}` as never)}
            </option>
          ))}
        </SelectField>
        <InputField label={t('fields.manufacturer')} name="manufacturer" required />
        <SelectField label={t('fields.organizationId')} name="organizationId" required>
          <option value="">—</option>
          {organizations.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </SelectField>
        <InputField label={t('fields.expectedYears')} min={0} name="expectedYears" type="number" />
        <InputField
          label={t('fields.expectedMonths')}
          min={0}
          name="expectedMonths"
          type="number"
        />
        <InputField label={t('fields.expectedDays')} min={0} name="expectedDays" type="number" />
        <TextareaField
          className="product-field--wide"
          label={t('fields.description')}
          name="description"
        />
      </FormGrid>
      <ActionMessage error={action.error} message={action.message} />
      <FormActions>
        <SubmitButton
          pending={action.pending}
          label={t('practitioner.addTsr')}
          pendingLabel={t('common.saving')}
        />
      </FormActions>
    </ProductForm>
  )
}

function DispenseForm({
  patients,
  devices,
  onCreated,
}: {
  patients: Patient[]
  devices: Device[]
  onCreated: () => void
}) {
  const t = useTranslations()
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const ok = await action.run(
      async () => {
        await apiRequest('/device-dispenses', {
          method: 'POST',
          body: {
            patientId: formValue(data, 'patientId'),
            deviceId: formValue(data, 'deviceId'),
            issuedAt: new Date(formValue(data, 'issuedAt')).toISOString(),
            observeYears: numberValue(data, 'observeYears'),
            observeMonths: numberValue(data, 'observeMonths'),
            observeDays: numberValue(data, 'observeDays'),
            notes: optionalValue(data, 'notes'),
          },
        })
      },
      t('practitioner.dispenseCreated'),
      t('errors.badRequest'),
    )
    if (ok) {
      target.reset()
      onCreated()
    }
  }
  return (
    <ProductForm onSubmit={submit}>
      <FormGrid>
        <SelectField label={t('fields.patientId')} name="patientId" required>
          <option value="">—</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {fullName(p)}
            </option>
          ))}
        </SelectField>
        <SelectField label={t('fields.deviceId')} name="deviceId" required>
          <option value="">—</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </SelectField>
        <InputField label={t('fields.issuedAt')} name="issuedAt" required type="datetime-local" />
        <InputField label={t('fields.observeYears')} min={0} name="observeYears" type="number" />
        <InputField label={t('fields.observeMonths')} min={0} name="observeMonths" type="number" />
        <InputField label={t('fields.observeDays')} min={0} name="observeDays" type="number" />
        <TextareaField className="product-field--wide" label={t('fields.notes')} name="notes" />
      </FormGrid>
      <ActionMessage error={action.error} message={action.message} />
      <FormActions>
        <SubmitButton
          pending={action.pending}
          label={t('practitioner.dispenseTsr')}
          pendingLabel={t('common.saving')}
        />
      </FormActions>
    </ProductForm>
  )
}

function PatientDispenses({ patient }: { patient: Patient }) {
  const t = useTranslations()
  const locale = useLocale()
  const [selected, setSelected] = useState<Dispense>()
  const list = useApiQuery<Dispense[]>(
    ['patient', patient.id, 'dispenses'],
    `/patients/${patient.id}/device-dispenses`,
    { query: { only_observable: false } },
  )
  const detail = selected ? <DispenseLookup value={selected} /> : null
  return (
    <ProductPanel title={t('practitioner.patientTsr')}>
      <p>{fullName(patient)}</p>
      {list.data?.length ? (
        <EntityGrid>
          {list.data.map((item) => (
            <EntityCard
              key={item.id}
              title={item.deviceName || t('product.tsrCard')}
              meta={formatDate(item.issuedAt, locale)}
              selected={selected?.id === item.id}
              onClick={() => setSelected(item)}
            />
          ))}
        </EntityGrid>
      ) : (
        <AsyncNotice
          loading={list.isLoading}
          error={list.isError}
          empty={!list.data?.length}
          loadingLabel={t('common.loading')}
          errorLabel={t('errors.generic')}
          emptyLabel={t('common.empty')}
        />
      )}
      {detail}
    </ProductPanel>
  )
}

function DispenseLookup({ value }: { value: Dispense }) {
  const t = useTranslations()
  const locale = useLocale()
  const detail = useApiQuery<Dispense>(['dispense', value.id], `/device-dispenses/${value.id}`)
  const item = detail.data ?? value
  return (
    <DetailList
      entries={[
        [t('fields.deviceId'), item.deviceName],
        [t('fields.issuedAt'), formatDate(item.issuedAt, locale)],
        [t('fields.notes'), item.notes],
        [t('patients.practitioner'), item.practitionerFullName],
      ]}
    />
  )
}

function PractitionerDevices() {
  const t = useTranslations()
  const labels = common(t)
  const [deviceOpen, setDeviceOpen] = useState(false)
  const [dispenseOpen, setDispenseOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device>()
  const [selectedPatient, setSelectedPatient] = useState<Patient>()
  const devices = useApiQuery<Device[]>(['devices'], '/devices')
  const organizations = useApiQuery<Organization[]>(['organizations'], '/organizations')
  const patients = useApiQuery<Patient[]>(['practitioner', 'patients', 'devices'], '/patients', {
    query: { only_observable: false },
  })
  const detail = selectedDevice ? <DeviceDetail item={selectedDevice} /> : null
  return (
    <ProductPage
      title={t('nav.devices')}
      description={t('practitioner.devicesDescription')}
      actions={
        <>
          <Button onClick={() => setDispenseOpen(true)}>{t('practitioner.dispenseTsr')}</Button>
          <Button onClick={() => setDeviceOpen(true)} variant="secondary">
            <Plus aria-hidden="true" size={17} /> {t('practitioner.addTsr')}
          </Button>
        </>
      }
    >
      <ActionPanel
        open={deviceOpen}
        title={t('practitioner.addTsr')}
        closeLabel={t('common.close')}
        onClose={() => setDeviceOpen(false)}
      >
        <DeviceCreateForm
          organizations={organizations.data ?? []}
          onCreated={() => devices.refetch()}
        />
      </ActionPanel>
      <ActionPanel
        open={dispenseOpen}
        title={t('practitioner.dispenseTsr')}
        closeLabel={t('common.close')}
        onClose={() => setDispenseOpen(false)}
      >
        <DispenseForm
          devices={devices.data ?? []}
          patients={patients.data ?? []}
          onCreated={() => selectedPatient && setSelectedPatient({ ...selectedPatient })}
        />
      </ActionPanel>
      <div className="product-layout">
        <ProductPanel title={t('practitioner.tsrCatalog')}>
          <AsyncNotice
            loading={devices.isLoading}
            error={devices.isError}
            empty={!devices.data?.length}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {devices.data?.length ? (
            <EntityGrid>
              {devices.data.map((device) => (
                <EntityCard
                  key={device.id}
                  title={device.name || t('product.tsrCard')}
                  meta={device.manufacturer}
                  detail={device.type ? t(`enums.${device.type}` as never) : undefined}
                  selected={selectedDevice?.id === device.id}
                  onClick={() => setSelectedDevice(device)}
                />
              ))}
            </EntityGrid>
          ) : null}
          {detail}
        </ProductPanel>
        <ProductPanel title={t('practitioner.patientTsr')}>
          <SelectField
            label={t('practitioner.choosePatient')}
            value={selectedPatient?.id ?? ''}
            onChange={(event) =>
              setSelectedPatient(patients.data?.find((p) => p.id === event.target.value))
            }
          >
            <option value="">—</option>
            {patients.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {fullName(p)}
              </option>
            ))}
          </SelectField>
          {selectedPatient ? <PatientDispenses patient={selectedPatient} /> : null}
        </ProductPanel>
      </div>
    </ProductPage>
  )
}

function DeviceDetail({ item }: { item: Device }) {
  const t = useTranslations()
  const detail = useApiQuery<Device>(['device', item.id], `/devices/${item.id}`)
  const value = detail.data ?? item
  return (
    <DetailList
      entries={[
        [t('fields.type'), value.type ? t(`enums.${value.type}` as never) : '—'],
        [
          t('fields.targetBodyPart'),
          value.targetBodyPart ? t(`enums.${value.targetBodyPart}` as never) : '—',
        ],
        [t('fields.manufacturer'), value.manufacturer],
        [t('fields.organizationId'), value.organizationName],
        [t('fields.description'), value.description],
      ]}
    />
  )
}

function PractitionerProfile() {
  const t = useTranslations()
  const labels = common(t)
  const client = useQueryClient()
  const profile = useApiQuery<Practitioner>(['practitioner', 'profile'], '/practitioners/me')
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    await action.run(
      async () => {
        await apiRequest('/practitioners/me', {
          method: 'PATCH',
          body: { phone: formValue(data, 'phone') },
        })
        await client.invalidateQueries({ queryKey: ['practitioner', 'profile'] })
      },
      t('profile.updated'),
      t('errors.badRequest'),
    )
  }
  return (
    <ProductPage title={t('profile.title')} description={t('practitioner.profileDescription')}>
      <div className="product-layout">
        <ProductPanel title={t('practitioner.contactData')}>
          <AsyncNotice
            loading={profile.isLoading}
            error={profile.isError}
            empty={!profile.data}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {profile.data ? (
            <>
              <DetailList
                entries={[
                  [t('profile.fullName'), fullName(profile.data)],
                  [t('fields.email'), profile.data.email],
                  [t('fields.licenseNumber'), profile.data.licenseNumber],
                  [t('fields.organizationId'), profile.data.organizationName],
                  [
                    t('fields.qualificationsId'),
                    profile.data.qualifications?.map((q) => q.name).join(', '),
                  ],
                ]}
              />
              <ProductForm onSubmit={submit}>
                <InputField
                  defaultValue={profile.data.phone}
                  label={t('profile.phone')}
                  name="phone"
                  required
                />
                <ActionMessage error={action.error} message={action.message} />
                <FormActions>
                  <SubmitButton
                    pending={action.pending}
                    label={t('common.save')}
                    pendingLabel={t('common.saving')}
                  />
                </FormActions>
              </ProductForm>
            </>
          ) : null}
        </ProductPanel>
        <PasswordForm />
      </div>
    </ProductPage>
  )
}

export function PractitionerWorkspace({
  section,
}: {
  section: 'patients' | 'reports' | 'complaints' | 'chat' | 'devices' | 'profile'
}) {
  if (section === 'patients') return <PractitionerPatients />
  if (section === 'reports') return <PractitionerReports />
  if (section === 'complaints') return <PractitionerComplaints />
  if (section === 'chat') return <PractitionerChat />
  if (section === 'devices') return <PractitionerDevices />
  return <PractitionerProfile />
}
