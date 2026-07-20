'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { PasswordForm } from '@/features/auth/password-form'
import { useSafePolling } from '@/features/chat/polling'
import { apiRequest } from '@/shared/api/client'
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
  FormActions,
  FormGrid,
  formatDate,
  fullName,
  InputField,
  optionalValue,
  ProductForm,
  ProductPage,
  ProductPanel,
  SegmentedControl,
  SelectField,
  SubmitButton,
  TextareaField,
  useActionState,
  formValue,
  numberValue,
} from '@/shared/ui/product-workspace'
import { StatusBadge } from '@/shared/ui/status-badge'

type Patient = components['schemas']['PatientResponse']
type Practitioner = components['schemas']['PractitionerResponse']
type Report = components['schemas']['QuestionnaireResponseResponse']
type Dispense = components['schemas']['DeviceDispenseResponse']
type Device = components['schemas']['DeviceResponse']
type Complaint = components['schemas']['DeviceComplainResponse']
type Message = components['schemas']['ChatMessageResponse']

const statusTones = { GREEN: 'success', YELLOW: 'warning', RED: 'danger' } as const

function sharedLabels(t: ReturnType<typeof useTranslations>) {
  return {
    loading: t('common.loading'),
    error: t('errors.generic'),
    empty: t('common.empty'),
    saved: t('profile.updated'),
  }
}

function ReportForm({ dispenses, onCreated }: { dispenses: Dispense[]; onCreated: () => void }) {
  const t = useTranslations()
  const action = useActionState()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const ok = await action.run(
      async () => {
        await apiRequest('/reports', {
          method: 'POST',
          body: {
            deviceId: formValue(data, 'deviceId'),
            painLevel: numberValue(data, 'painLevel'),
            discomfortLevel: numberValue(data, 'discomfortLevel'),
            mobilityLevel: numberValue(data, 'mobilityLevel'),
            sleepQuality: numberValue(data, 'sleepQuality'),
            comment: optionalValue(data, 'comment'),
          },
        })
      },
      t('product.reportSent'),
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
        <SelectField label={t('fields.deviceId')} name="deviceId" required>
          <option value="">{t('product.chooseDevice')}</option>
          {dispenses.map((dispense) => (
            <option key={dispense.id} value={dispense.deviceId}>
              {dispense.deviceName}
            </option>
          ))}
        </SelectField>
        <InputField
          label={t('reports.pain')}
          max={10}
          min={0}
          name="painLevel"
          required
          type="number"
        />
        <InputField
          label={t('reports.discomfort')}
          max={10}
          min={0}
          name="discomfortLevel"
          required
          type="number"
        />
        <InputField
          label={t('reports.mobility')}
          max={10}
          min={0}
          name="mobilityLevel"
          type="number"
        />
        <InputField label={t('reports.sleep')} max={10} min={0} name="sleepQuality" type="number" />
        <TextareaField
          className="product-field--wide"
          label={t('reports.comment')}
          name="comment"
        />
      </FormGrid>
      <ActionMessage error={action.error} message={action.message} />
      <FormActions>
        <SubmitButton
          pending={action.pending}
          label={t('common.send')}
          pendingLabel={t('common.sending')}
        />
      </FormActions>
    </ProductForm>
  )
}

function PatientReports() {
  const t = useTranslations()
  const locale = useLocale()
  const labels = sharedLabels(t)
  const [formOpen, setFormOpen] = useState(false)
  const reports = useApiQuery<Report[]>(['patient', 'reports'], '/reports/my')
  const dispenses = useApiQuery<Dispense[]>(
    ['patient', 'dispenses', 'active'],
    '/device-dispenses/me',
    {
      query: { only_observable: true },
    },
  )

  return (
    <ProductPage
      title={t('reports.title')}
      description={t('product.reportsDescription')}
      actions={
        <Button onClick={() => setFormOpen(true)}>
          <Plus aria-hidden="true" size={18} /> {t('reports.new')}
        </Button>
      }
    >
      <ActionPanel
        open={formOpen}
        title={t('reports.new')}
        closeLabel={t('common.close')}
        onClose={() => setFormOpen(false)}
      >
        <ReportForm dispenses={dispenses.data ?? []} onCreated={() => reports.refetch()} />
      </ActionPanel>
      <ProductPanel title={t('reports.history')} description={t('product.reportsHistoryHint')}>
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
      </ProductPanel>
    </ProductPage>
  )
}

function DispenseDetail({ dispense }: { dispense: Dispense }) {
  const t = useTranslations()
  const locale = useLocale()
  const detail = useApiQuery<Dispense>(
    ['dispense', dispense.id],
    `/device-dispenses/${dispense.id}`,
  )
  const device = useApiQuery<Device>(['device', dispense.deviceId], `/devices/${dispense.deviceId}`)
  const value = detail.data ?? dispense
  return (
    <ProductPanel
      title={value.deviceName || t('product.tsrCard')}
      description={t('product.dispenseDetails')}
    >
      <DetailList
        entries={[
          [t('devices.dispensedAt'), formatDate(value.issuedAt, locale)],
          [t('fields.manufacturer'), device.data?.manufacturer],
          [t('fields.type'), device.data?.type ? t(`enums.${device.data.type}` as never) : '—'],
          [
            t('fields.targetBodyPart'),
            device.data?.targetBodyPart ? t(`enums.${device.data.targetBodyPart}` as never) : '—',
          ],
          [t('fields.notes'), value.notes],
          [t('fields.description'), device.data?.description],
        ]}
      />
    </ProductPanel>
  )
}

function PatientDevices() {
  const t = useTranslations()
  const locale = useLocale()
  const labels = sharedLabels(t)
  const [view, setView] = useState('active')
  const [selected, setSelected] = useState<Dispense>()
  const dispenses = useApiQuery<Dispense[]>(
    ['patient', 'dispenses', view],
    '/device-dispenses/me',
    {
      query: { only_observable: view === 'active' },
    },
  )
  return (
    <ProductPage title={t('product.myTsr')} description={t('product.devicesDescription')}>
      <SegmentedControl
        label={t('common.filter')}
        value={view}
        onChange={setView}
        options={[
          { value: 'active', label: t('product.activeObservation') },
          { value: 'all', label: t('common.all') },
        ]}
      />
      <div className="product-layout">
        <ProductPanel title={t('product.dispenses')}>
          <AsyncNotice
            loading={dispenses.isLoading}
            error={dispenses.isError}
            empty={!dispenses.data?.length}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {dispenses.data?.length ? (
            <EntityGrid>
              {dispenses.data.map((dispense) => (
                <EntityCard
                  key={dispense.id}
                  title={dispense.deviceName || t('product.tsrCard')}
                  meta={formatDate(dispense.issuedAt, locale)}
                  detail={dispense.notes}
                  selected={selected?.id === dispense.id}
                  onClick={() => setSelected(dispense)}
                />
              ))}
            </EntityGrid>
          ) : null}
        </ProductPanel>
        {selected ? (
          <DispenseDetail dispense={selected} />
        ) : (
          <ProductPanel title={t('product.tsrCard')}>
            <AsyncNotice
              empty
              emptyLabel={t('product.chooseTsr')}
              loadingLabel={labels.loading}
              errorLabel={labels.error}
            />
          </ProductPanel>
        )}
      </div>
    </ProductPage>
  )
}

function ComplaintForm({ dispenses, onCreated }: { dispenses: Dispense[]; onCreated: () => void }) {
  const t = useTranslations()
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const input = new FormData(target)
    const ok = await action.run(
      async () => {
        const body = new FormData()
        body.set('deviceDispenseId', formValue(input, 'deviceDispenseId'))
        body.set('reason', formValue(input, 'reason'))
        const comment = optionalValue(input, 'comment')
        if (comment) body.set('comment', comment)
        const photos = input
          .getAll('photos')
          .filter((value): value is File => value instanceof File && value.size > 0)
        for (const photo of await prepareImages(photos, 5)) body.append('photos', photo)
        await apiRequest('/device-complains', { method: 'POST', body })
      },
      t('product.complaintSent'),
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
        <SelectField label={t('fields.deviceDispenseId')} name="deviceDispenseId" required>
          <option value="">{t('product.chooseDevice')}</option>
          {dispenses.map((dispense) => (
            <option key={dispense.id} value={dispense.id}>
              {dispense.deviceName}
            </option>
          ))}
        </SelectField>
        <SelectField label={t('complaints.reason')} name="reason" required>
          <option value="">{t('product.chooseReason')}</option>
          {['BREAKAGE', 'WEAR_AND_TEAR', 'DISCOMFORT', 'OTHER'].map((value) => (
            <option key={value} value={value}>
              {t(`enums.${value}` as never)}
            </option>
          ))}
        </SelectField>
        <TextareaField
          className="product-field--wide"
          label={t('complaints.comment')}
          name="comment"
        />
        <InputField
          accept="image/*"
          className="product-field--wide"
          label={t('complaints.photos')}
          multiple
          name="photos"
          type="file"
          hint={t('product.photoHint')}
        />
      </FormGrid>
      <ActionMessage error={action.error} message={action.message} />
      <FormActions>
        <SubmitButton
          pending={action.pending}
          label={t('common.send')}
          pendingLabel={t('common.sending')}
        />
      </FormActions>
    </ProductForm>
  )
}

function ComplaintDetail({ complaint }: { complaint: Complaint }) {
  const t = useTranslations()
  const locale = useLocale()
  const detail = useApiQuery<Complaint>(
    ['complaint', complaint.id],
    `/device-complains/${complaint.id}`,
  )
  const value = detail.data ?? complaint
  return (
    <ProductPanel title={value.deviceName || t('complaints.title')}>
      <DetailList
        entries={[
          [t('complaints.reason'), value.reason ? t(`enums.${value.reason}` as never) : '—'],
          [t('fields.status'), value.status ? t(`enums.${value.status}` as never) : '—'],
          [t('fields.comment'), value.comment],
          [t('complaints.resolution'), value.reviewDecision],
          [t('fields.issuedAt'), formatDate(value.createdAt, locale)],
          [t('patients.practitioner'), value.reviewedByFullName],
        ]}
      />
      {value.photos?.length ? (
        <div className="photo-grid">
          {value.photos.map((photo) => (
            <ProtectedImage
              key={photo.id}
              alt={t('complaints.photos')}
              height={140}
              width={180}
              src={`/api/backend/files?path=${encodeURIComponent(photo.imagePath ?? '')}`}
            />
          ))}
        </div>
      ) : null}
    </ProductPanel>
  )
}

function PatientComplaints() {
  const t = useTranslations()
  const locale = useLocale()
  const labels = sharedLabels(t)
  const [view, setView] = useState('open')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Complaint>()
  const complaints = useApiQuery<Complaint[]>(
    ['patient', 'complaints', view],
    '/device-complains/my',
    { query: { reviewed: view === 'reviewed' } },
  )
  const dispenses = useApiQuery<Dispense[]>(
    ['patient', 'dispenses', 'all'],
    '/device-dispenses/me',
    { query: { only_observable: false } },
  )
  return (
    <ProductPage
      title={t('complaints.title')}
      description={t('product.complaintsDescription')}
      actions={
        <Button onClick={() => setFormOpen(true)}>
          <Plus aria-hidden="true" size={18} /> {t('complaints.new')}
        </Button>
      }
    >
      <ActionPanel
        open={formOpen}
        title={t('complaints.new')}
        closeLabel={t('common.close')}
        onClose={() => setFormOpen(false)}
      >
        <ComplaintForm dispenses={dispenses.data ?? []} onCreated={() => complaints.refetch()} />
      </ActionPanel>
      <SegmentedControl
        label={t('common.filter')}
        value={view}
        onChange={setView}
        options={[
          { value: 'open', label: t('product.openComplaints') },
          { value: 'reviewed', label: t('product.reviewedComplaints') },
        ]}
      />
      <div className="product-layout">
        <ProductPanel title={t('product.myComplaints')}>
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
                  title={complaint.deviceName || t('complaints.title')}
                  meta={complaint.reason ? t(`enums.${complaint.reason}` as never) : undefined}
                  detail={formatDate(complaint.createdAt, locale)}
                  badge={
                    complaint.status ? (
                      <StatusBadge
                        tone={
                          complaint.status === 'COMPLETED' || complaint.status === 'APPROVED'
                            ? 'success'
                            : complaint.status === 'REJECTED'
                              ? 'danger'
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
          <ComplaintDetail complaint={selected} />
        ) : (
          <ProductPanel title={t('product.complaintCard')}>
            <AsyncNotice
              empty
              emptyLabel={t('product.chooseComplaint')}
              loadingLabel={labels.loading}
              errorLabel={labels.error}
            />
          </ProductPanel>
        )}
      </div>
    </ProductPage>
  )
}

function MessageComposer({ onSent }: { onSent: () => void }) {
  const t = useTranslations()
  const action = useActionState()
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
          await apiRequest('/chat/messages/photo', { method: 'POST', body })
        } else {
          await apiRequest('/chat/messages', {
            method: 'POST',
            body: { content: formValue(data, 'content') },
          })
        }
      },
      t('product.messageSent'),
      t('errors.badRequest'),
    )
    if (ok) {
      target.reset()
      onSent()
    }
  }
  return (
    <ProductForm onSubmit={submit}>
      <TextareaField label={t('chat.message')} name="content" />
      <InputField accept="image/*" label={t('chat.photo')} name="photo" type="file" />
      <ActionMessage error={action.error} message={action.message} />
      <FormActions>
        <SubmitButton
          pending={action.pending}
          label={t('common.send')}
          pendingLabel={t('common.sending')}
        />
      </FormActions>
    </ProductForm>
  )
}

function PatientChat() {
  const t = useTranslations()
  const locale = useLocale()
  const labels = sharedLabels(t)
  const messages = useApiQuery<Message[]>(['patient', 'chat'], '/chat/messages')
  const unread = useApiQuery<number>(['patient', 'chat', 'unread'], '/chat/messages/unread')
  useSafePolling(() => messages.refetch(), 10_000, true)
  useSafePolling(() => unread.refetch(), 30_000, true)
  return (
    <ProductPage title={t('chat.title')} description={t('product.chatDescription')}>
      <div className="product-layout">
        <ProductPanel
          title={t('product.conversation')}
          action={
            typeof unread.data === 'number' && unread.data > 0 ? (
              <StatusBadge tone="info">
                {unread.data} {t('product.unread')}
              </StatusBadge>
            ) : null
          }
        >
          <AsyncNotice
            loading={messages.isLoading}
            error={messages.isError}
            empty={!messages.data?.length}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={t('chat.empty')}
          />
          {messages.data?.length ? (
            <div className="message-list">
              {messages.data.map((message) => (
                <article
                  className={`message-bubble ${message.senderType === 'PATIENT' ? 'message-bubble--own' : ''}`}
                  key={message.id}
                >
                  {message.imageUrl ? (
                    <ProtectedImage
                      alt={t('chat.photo')}
                      height={180}
                      width={260}
                      src={`/api/backend/files?path=${encodeURIComponent(message.imageUrl)}`}
                    />
                  ) : null}
                  <p>{message.content}</p>
                  <small>{formatDate(message.sentAt, locale)}</small>
                </article>
              ))}
            </div>
          ) : null}
        </ProductPanel>
        <ProductPanel title={t('chat.message')}>
          <MessageComposer onSent={() => messages.refetch()} />
        </ProductPanel>
      </div>
    </ProductPage>
  )
}

function PractitionerSummary({ id }: { id: string }) {
  const t = useTranslations()
  const practitioner = useApiQuery<Practitioner>(['practitioner', id], `/practitioners/${id}`)
  if (!practitioner.data) return null
  return (
    <ProductPanel title={t('patients.practitioner')}>
      <DetailList
        entries={[
          [t('profile.fullName'), fullName(practitioner.data)],
          [t('profile.phone'), practitioner.data.phone],
          [t('fields.email'), practitioner.data.email],
          [t('fields.organizationId'), practitioner.data.organizationName],
        ]}
      />
    </ProductPanel>
  )
}

function PatientProfile() {
  const t = useTranslations()
  const labels = sharedLabels(t)
  const queryClient = useQueryClient()
  const patient = useApiQuery<Patient>(['patient', 'profile'], '/patients/me', {
    query: { only_observable: false },
  })
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    await action.run(
      async () => {
        await apiRequest('/patients/me', {
          method: 'PATCH',
          body: { phone: formValue(data, 'phone'), address: formValue(data, 'address') },
        })
        await queryClient.invalidateQueries({ queryKey: ['patient'] })
      },
      labels.saved,
      t('errors.badRequest'),
    )
  }
  return (
    <ProductPage title={t('profile.title')} description={t('product.profileDescription')}>
      <div className="product-layout">
        <ProductPanel title={t('product.personalData')}>
          <AsyncNotice
            loading={patient.isLoading}
            error={patient.isError}
            empty={!patient.data}
            loadingLabel={labels.loading}
            errorLabel={labels.error}
            emptyLabel={labels.empty}
          />
          {patient.data ? (
            <>
              <DetailList
                entries={[
                  [t('profile.fullName'), fullName(patient.data)],
                  [t('fields.iin'), patient.data.iin],
                  [t('fields.email'), patient.data.email],
                  [t('fields.city'), patient.data.city],
                  [t('fields.birthDate'), patient.data.birthDate],
                  [
                    t('patients.status'),
                    patient.data.status ? (
                      <StatusBadge tone={statusTones[patient.data.status]}>
                        {t(`enums.${patient.data.status}` as never)}
                      </StatusBadge>
                    ) : (
                      '—'
                    ),
                  ],
                ]}
              />
              <ProductForm onSubmit={submit}>
                <FormGrid>
                  <InputField
                    defaultValue={patient.data.phone}
                    label={t('profile.phone')}
                    name="phone"
                    required
                  />
                  <InputField
                    defaultValue={patient.data.address}
                    label={t('profile.address')}
                    name="address"
                    required
                  />
                </FormGrid>
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
        <div className="product-form">
          {patient.data?.practitionerId ? (
            <PractitionerSummary id={patient.data.practitionerId} />
          ) : null}
          <PasswordForm />
        </div>
      </div>
    </ProductPage>
  )
}

export function PatientWorkspace({
  section,
}: {
  section: 'reports' | 'devices' | 'complaints' | 'chat' | 'profile'
}) {
  if (section === 'reports') return <PatientReports />
  if (section === 'devices') return <PatientDevices />
  if (section === 'complaints') return <PatientComplaints />
  if (section === 'chat') return <PatientChat />
  return <PatientProfile />
}
