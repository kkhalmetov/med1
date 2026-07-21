'use client'

import { Download, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState, type FormEvent, type ReactNode } from 'react'
import { PasswordForm } from '@/features/auth/password-form'
import { PatientShortReview } from '@/features/patients/patient-short-review'
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

type Qualification = components['schemas']['QualificationResponse']
type Organization = components['schemas']['OrganizationResponse']
type Practitioner = components['schemas']['PractitionerResponse']
type Device = components['schemas']['DeviceResponse']
type Dispense = components['schemas']['DeviceDispenseResponse']

function labels(t: ReturnType<typeof useTranslations>) {
  return { loading: t('common.loading'), error: t('errors.generic'), empty: t('common.empty') }
}

async function download(path: string, filename: string) {
  saveDownload(await fetchDownload(path, filename))
}

function RegistryLayout<T extends { id?: string }>({
  items,
  loading,
  error,
  selected,
  renderCard,
  detail,
  emptyDetail,
}: {
  items: T[] | undefined
  loading: boolean
  error: boolean
  selected: T | undefined
  renderCard: (item: T, selected: boolean) => ReactNode
  detail: ReactNode
  emptyDetail: string
}) {
  const t = useTranslations()
  const common = labels(t)
  return (
    <div className="product-layout">
      <ProductPanel title={t('admin.registry')}>
        <AsyncNotice
          loading={loading}
          error={error}
          empty={!items?.length}
          loadingLabel={common.loading}
          errorLabel={common.error}
          emptyLabel={common.empty}
        />
        {items?.length ? (
          <EntityGrid>
            {items.map((item) => (
              <div key={item.id}>{renderCard(item, selected?.id === item.id)}</div>
            ))}
          </EntityGrid>
        ) : null}
      </ProductPanel>
      {selected ? (
        detail
      ) : (
        <ProductPanel title={t('admin.card')}>
          <AsyncNotice
            empty
            emptyLabel={emptyDetail}
            loadingLabel={common.loading}
            errorLabel={common.error}
          />
        </ProductPanel>
      )}
    </div>
  )
}

function QualificationForm({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations()
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const ok = await action.run(
      async () => {
        await apiRequest('/qualifications', {
          method: 'POST',
          body: { name: formValue(data, 'name'), code: optionalValue(data, 'code') },
        })
      },
      t('admin.qualificationCreated'),
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
        <InputField label={t('fields.name')} name="name" required />
        <InputField label={t('fields.code')} name="code" />
      </FormGrid>
      <ActionMessage error={action.error} message={action.message} />
      <FormActions>
        <SubmitButton
          pending={action.pending}
          label={t('admin.addQualification')}
          pendingLabel={t('common.saving')}
        />
      </FormActions>
    </ProductForm>
  )
}

function QualificationDetail({ item }: { item: Qualification }) {
  const t = useTranslations()
  const detail = useApiQuery<Qualification>(
    ['qualification', item.id],
    `/qualifications/${item.id}`,
  )
  const value = detail.data ?? item
  return (
    <ProductPanel title={value.name || t('admin.qualificationCard')}>
      <DetailList
        entries={[
          [t('fields.name'), value.name],
          [t('fields.code'), value.code],
        ]}
      />
    </ProductPanel>
  )
}

function AdminQualifications() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Qualification>()
  const query = useApiQuery<Qualification[]>(['admin', 'qualifications'], '/qualifications')
  return (
    <ProductPage
      title={t('nav.qualifications')}
      description={t('admin.qualificationsDescription')}
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus aria-hidden="true" size={18} /> {t('admin.addQualification')}
        </Button>
      }
    >
      <ActionPanel
        open={open}
        title={t('admin.addQualification')}
        closeLabel={t('common.close')}
        onClose={() => setOpen(false)}
      >
        <QualificationForm onCreated={() => query.refetch()} />
      </ActionPanel>
      <RegistryLayout
        items={query.data}
        loading={query.isLoading}
        error={query.isError}
        selected={selected}
        renderCard={(item, active) => (
          <EntityCard
            title={item.name || t('admin.qualificationCard')}
            meta={item.code}
            selected={active}
            onClick={() => setSelected(item)}
          />
        )}
        detail={selected ? <QualificationDetail item={selected} /> : null}
        emptyDetail={t('admin.chooseQualification')}
      />
    </ProductPage>
  )
}

function OrganizationForm({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations()
  const action = useActionState()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = event.currentTarget
    const data = new FormData(target)
    const ok = await action.run(
      async () => {
        await apiRequest('/organizations', {
          method: 'POST',
          body: {
            name: formValue(data, 'name'),
            type: optionalValue(data, 'type'),
            code: optionalValue(data, 'code'),
            description: optionalValue(data, 'description'),
            city: optionalValue(data, 'city'),
            address: optionalValue(data, 'address'),
          },
        })
      },
      t('admin.organizationCreated'),
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
        <InputField label={t('fields.name')} name="name" required />
        <InputField label={t('fields.type')} name="type" />
        <InputField label={t('fields.code')} name="code" />
        <InputField label={t('fields.city')} name="city" />
        <InputField className="product-field--wide" label={t('fields.address')} name="address" />
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
          label={t('admin.addOrganization')}
          pendingLabel={t('common.saving')}
        />
      </FormActions>
    </ProductForm>
  )
}

function OrganizationDetail({ item }: { item: Organization }) {
  const t = useTranslations()
  const detail = useApiQuery<Organization>(['organization', item.id], `/organizations/${item.id}`)
  const value = detail.data ?? item
  return (
    <ProductPanel title={value.name || t('admin.organizationCard')}>
      <DetailList
        entries={[
          [t('fields.type'), value.type],
          [t('fields.code'), value.code],
          [t('fields.city'), value.city],
          [t('fields.address'), value.address],
          [t('fields.description'), value.description],
        ]}
      />
    </ProductPanel>
  )
}

function AdminOrganizations() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Organization>()
  const query = useApiQuery<Organization[]>(['admin', 'organizations'], '/organizations')
  return (
    <ProductPage
      title={t('nav.organizations')}
      description={t('admin.organizationsDescription')}
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus aria-hidden="true" size={18} /> {t('admin.addOrganization')}
        </Button>
      }
    >
      <ActionPanel
        open={open}
        title={t('admin.addOrganization')}
        closeLabel={t('common.close')}
        onClose={() => setOpen(false)}
      >
        <OrganizationForm onCreated={() => query.refetch()} />
      </ActionPanel>
      <RegistryLayout
        items={query.data}
        loading={query.isLoading}
        error={query.isError}
        selected={selected}
        renderCard={(item, active) => (
          <EntityCard
            title={item.name || t('admin.organizationCard')}
            meta={[item.city, item.type].filter(Boolean).join(' · ')}
            selected={active}
            onClick={() => setSelected(item)}
          />
        )}
        detail={selected ? <OrganizationDetail item={selected} /> : null}
        emptyDetail={t('admin.chooseOrganization')}
      />
    </ProductPage>
  )
}

function PractitionerForm({
  organizations,
  qualifications,
  onCreated,
}: {
  organizations: Organization[]
  qualifications: Qualification[]
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
        const body = new FormData()
        for (const name of [
          'firstName',
          'lastName',
          'middleName',
          'iin',
          'email',
          'phone',
          'organizationId',
          'licenseNumber',
        ]) {
          const value = optionalValue(data, name)
          if (value) body.set(name, value)
        }
        for (const value of data.getAll('qualificationsId'))
          body.append('qualificationsId', String(value))
        const photo = data.get('photo')
        if (photo instanceof File && photo.size > 0) {
          const [prepared] = await prepareImages([photo], 1)
          if (prepared) body.set('photo', prepared)
        }
        await apiRequest('/practitioners', { method: 'POST', body })
      },
      t('admin.practitionerCreated'),
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
        <InputField label={t('fields.email')} name="email" required type="email" />
        <InputField label={t('fields.phone')} name="phone" required />
        <InputField label={t('fields.licenseNumber')} name="licenseNumber" required />
        <SelectField label={t('fields.organizationId')} name="organizationId" required>
          <option value="">—</option>
          {organizations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          className="product-field--wide"
          label={t('fields.qualificationsId')}
          multiple
          name="qualificationsId"
          required
        >
          {qualifications.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectField>
        <FileField
          accept="image/*"
          className="product-field--wide"
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
          label={t('admin.registerPractitioner')}
          pendingLabel={t('common.saving')}
        />
      </FormActions>
    </ProductForm>
  )
}

function PractitionerDetail({ item }: { item: Practitioner }) {
  const t = useTranslations()
  const detail = useApiQuery<Practitioner>(
    ['admin', 'practitioner', item.id],
    `/practitioners/${item.id}`,
  )
  const value = detail.data ?? item
  return (
    <ProductPanel title={fullName(value)}>
      {value.imagePath ? (
        <ProtectedImage
          alt={fullName(value)}
          height={120}
          src={`/api/backend/files?path=${encodeURIComponent(value.imagePath)}`}
          width={120}
        />
      ) : null}
      <DetailList
        entries={[
          [t('fields.email'), value.email],
          [t('fields.phone'), value.phone],
          [t('fields.iin'), value.iin],
          [t('fields.licenseNumber'), value.licenseNumber],
          [t('fields.organizationId'), value.organizationName],
          [t('fields.qualificationsId'), value.qualifications?.map((item) => item.name).join(', ')],
        ]}
      />
    </ProductPanel>
  )
}

function AdminPractitioners() {
  const t = useTranslations()
  const action = useActionState()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Practitioner>()
  const query = useApiQuery<Practitioner[]>(['admin', 'practitioners'], '/practitioners')
  const orgs = useApiQuery<Organization[]>(['organizations'], '/organizations')
  const qualifications = useApiQuery<Qualification[]>(['qualifications'], '/qualifications')
  async function exportCsv() {
    await action.run(
      () => download('/practitioners/export', 'qadam-practitioners.csv'),
      t('admin.downloadReady'),
      t('errors.generic'),
    )
  }
  return (
    <ProductPage
      title={t('nav.practitioners')}
      description={t('admin.practitionersDescription')}
      actions={
        <>
          <Button onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" size={18} /> {t('admin.registerPractitioner')}
          </Button>
          <Button onClick={exportCsv} variant="secondary">
            <Download aria-hidden="true" size={17} /> {t('admin.downloadCsv')}
          </Button>
        </>
      }
    >
      <ActionMessage error={action.error} message={action.message} />
      <ActionPanel
        open={open}
        title={t('admin.registerPractitioner')}
        closeLabel={t('common.close')}
        onClose={() => setOpen(false)}
      >
        <PractitionerForm
          organizations={orgs.data ?? []}
          qualifications={qualifications.data ?? []}
          onCreated={() => query.refetch()}
        />
      </ActionPanel>
      <RegistryLayout
        items={query.data}
        loading={query.isLoading}
        error={query.isError}
        selected={selected}
        renderCard={(item, active) => (
          <EntityCard
            title={fullName(item)}
            meta={item.organizationName}
            detail={item.phone}
            selected={active}
            onClick={() => setSelected(item)}
          />
        )}
        detail={selected ? <PractitionerDetail item={selected} /> : null}
        emptyDetail={t('admin.choosePractitioner')}
      />
    </ProductPage>
  )
}

function DeviceForm({
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
      t('admin.deviceCreated'),
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
          label={t('admin.addTsr')}
          pendingLabel={t('common.saving')}
        />
      </FormActions>
    </ProductForm>
  )
}

function DeviceDetail({ item }: { item: Device }) {
  const t = useTranslations()
  const detail = useApiQuery<Device>(['admin', 'device', item.id], `/devices/${item.id}`)
  const value = detail.data ?? item
  return (
    <ProductPanel title={value.name || t('admin.tsrCard')}>
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
    </ProductPanel>
  )
}

function AdminDevices() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Device>()
  const query = useApiQuery<Device[]>(['admin', 'devices'], '/devices')
  const orgs = useApiQuery<Organization[]>(['organizations'], '/organizations')
  return (
    <ProductPage
      title={t('nav.devices')}
      description={t('admin.devicesDescription')}
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus aria-hidden="true" size={18} /> {t('admin.addTsr')}
        </Button>
      }
    >
      <ActionPanel
        open={open}
        title={t('admin.addTsr')}
        closeLabel={t('common.close')}
        onClose={() => setOpen(false)}
      >
        <DeviceForm organizations={orgs.data ?? []} onCreated={() => query.refetch()} />
      </ActionPanel>
      <RegistryLayout
        items={query.data}
        loading={query.isLoading}
        error={query.isError}
        selected={selected}
        renderCard={(item, active) => (
          <EntityCard
            title={item.name || t('admin.tsrCard')}
            meta={item.manufacturer}
            detail={item.organizationName}
            selected={active}
            onClick={() => setSelected(item)}
          />
        )}
        detail={selected ? <DeviceDetail item={selected} /> : null}
        emptyDetail={t('admin.chooseTsr')}
      />
    </ProductPage>
  )
}

function DispenseDetails({ item }: { item: Dispense }) {
  const t = useTranslations()
  const locale = useLocale()
  const detail = useApiQuery<Dispense>(
    ['admin', 'dispense', item.id],
    `/device-dispenses/${item.id}`,
  )
  const value = detail.data ?? item
  return (
    <ProductPanel title={value.deviceName || t('admin.dispenseCard')}>
      <DetailList
        entries={[
          [t('fields.patientId'), value.patientFullName],
          [t('fields.deviceId'), value.deviceName],
          [t('fields.issuedAt'), formatDate(value.issuedAt, locale)],
          [t('patients.practitioner'), value.practitionerFullName],
          [t('fields.notes'), value.notes],
        ]}
      />
    </ProductPanel>
  )
}

function AdminDispenses() {
  const t = useTranslations()
  const action = useActionState()
  const [patientId, setPatientId] = useState('')
  const [filter, setFilter] = useState('active')
  const [selected, setSelected] = useState<Dispense>()
  const enabledId = /^[0-9a-f-]{36}$/i.test(patientId)
  async function exportPatients() {
    await action.run(
      () => download('/patients/export', 'qadam-patients.csv'),
      t('admin.downloadReady'),
      t('errors.generic'),
    )
  }
  return (
    <ProductPage
      title={t('admin.dispenseTitle')}
      description={t('admin.dispensesDescription')}
      actions={
        <Button onClick={exportPatients} variant="secondary">
          <Download aria-hidden="true" size={17} /> {t('admin.downloadPatients')}
        </Button>
      }
    >
      <ActionMessage error={action.error} message={action.message} />
      <ProductPanel title={t('admin.findPatientDispenses')} description={t('admin.patientIdHint')}>
        <div className="dispense-search-controls">
          <InputField
            label={t('admin.patientIdentifier')}
            value={patientId}
            onChange={(event) => setPatientId(event.target.value.trim())}
            placeholder="00000000-0000-0000-0000-000000000000"
          />
          <div className="product-filter-field">
            <span>{t('common.filter')}</span>
            <SegmentedControl
              label={t('common.filter')}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'active', label: t('patients.observableOnly') },
                { value: 'all', label: t('common.all') },
              ]}
            />
          </div>
        </div>
      </ProductPanel>
      {enabledId ? (
        <AdminDispenseResults
          filter={filter}
          patientId={patientId}
          selected={selected}
          onSelect={setSelected}
        />
      ) : (
        <ProductPanel title={t('admin.dispenseTitle')}>
          <AsyncNotice
            empty
            emptyLabel={t('admin.enterPatientId')}
            loadingLabel={t('common.loading')}
            errorLabel={t('errors.generic')}
          />
        </ProductPanel>
      )}
    </ProductPage>
  )
}

function AdminDispenseResults({
  patientId,
  filter,
  selected,
  onSelect,
}: {
  patientId: string
  filter: string
  selected: Dispense | undefined
  onSelect: (value: Dispense) => void
}) {
  const t = useTranslations()
  const locale = useLocale()
  const query = useApiQuery<Dispense[]>(
    ['admin', 'dispenses', patientId, filter],
    `/patients/${patientId}/device-dispenses`,
    { query: { only_observable: filter === 'active' } },
  )
  const errorLabel =
    query.error instanceof ApiError && query.error.code === 'NOT_FOUND'
      ? t('admin.patientNotFound')
      : t('errors.generic')
  return (
    <div className="admin-patient-context">
      {query.isSuccess ? <PatientShortReview patientId={patientId} /> : null}
      <div className="product-layout">
        <ProductPanel title={t('admin.dispenseTitle')}>
          <AsyncNotice
            loading={query.isLoading}
            error={query.isError}
            empty={!query.data?.length}
            loadingLabel={t('common.loading')}
            errorLabel={errorLabel}
            emptyLabel={t('common.empty')}
          />
          {query.data?.length ? (
            <EntityGrid>
              {query.data.map((item) => (
                <EntityCard
                  key={item.id}
                  title={item.deviceName || t('admin.dispenseCard')}
                  meta={formatDate(item.issuedAt, locale)}
                  detail={item.patientFullName}
                  selected={selected?.id === item.id}
                  onClick={() => onSelect(item)}
                />
              ))}
            </EntityGrid>
          ) : null}
        </ProductPanel>
        {selected ? (
          <DispenseDetails item={selected} />
        ) : (
          <ProductPanel title={t('admin.dispenseCard')}>
            <AsyncNotice
              empty
              emptyLabel={t('admin.chooseDispense')}
              loadingLabel={t('common.loading')}
              errorLabel={t('errors.generic')}
            />
          </ProductPanel>
        )}
      </div>
    </div>
  )
}

function AdminProfile() {
  const t = useTranslations()
  return (
    <ProductPage title={t('profile.title')} description={t('admin.profileDescription')}>
      <PasswordForm />
    </ProductPage>
  )
}

export function AdminWorkspace({
  section,
}: {
  section:
    'qualifications' | 'organizations' | 'practitioners' | 'devices' | 'dispenses' | 'profile'
}) {
  if (section === 'qualifications') return <AdminQualifications />
  if (section === 'organizations') return <AdminOrganizations />
  if (section === 'practitioners') return <AdminPractitioners />
  if (section === 'devices') return <AdminDevices />
  if (section === 'dispenses') return <AdminDispenses />
  return <AdminProfile />
}
