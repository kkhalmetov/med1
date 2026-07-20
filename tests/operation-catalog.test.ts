import { describe, expect, it } from 'vitest'
import { authOperationIds, operationGroups } from '@/shared/api/operation-catalog'
import { backendOperations } from '@/server/backend/policy'
import { getOperationDefinitions } from '@/server/backend/form-contract'

describe('frontend operation catalog', () => {
  it('assigns every Swagger operation to auth or at least one visible role workspace', () => {
    const visible = new Set<string>(Object.values(operationGroups).flat())
    const covered = new Set<string>([...visible, ...authOperationIds])
    expect(covered.size).toBe(52)
    expect(
      backendOperations.map(({ operationId }) => operationId).filter((id) => !covered.has(id)),
    ).toEqual([])
  })

  it('preserves exact report field bounds from OpenAPI', () => {
    const [report] = getOperationDefinitions(['create'])
    expect(report?.fields.find(({ name }) => name === 'painLevel')).toMatchObject({
      min: 0,
      max: 10,
    })
    expect(report?.fields.find(({ name }) => name === 'discomfortLevel')).toMatchObject({
      min: 0,
      max: 10,
      required: true,
    })
  })
})
