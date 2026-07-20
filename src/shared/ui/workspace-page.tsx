import { OperationWorkbench } from './operation-workbench'
import type { OperationDefinition } from '@/shared/api/operation-form'
import { PasswordForm } from '@/features/auth/password-form'

export function WorkspacePage({
  eyebrow,
  title,
  definitions,
  includePassword = false,
}: {
  eyebrow: string
  title: string
  definitions: OperationDefinition[]
  includePassword?: boolean
}) {
  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </header>
      <OperationWorkbench definitions={definitions} />
      {includePassword ? <PasswordForm /> : null}
    </div>
  )
}
