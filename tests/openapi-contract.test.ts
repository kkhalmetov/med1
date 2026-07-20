import { describe, expect, it } from 'vitest'
import { summarizeOpenApi } from '@/shared/api/openapi'

describe('OpenAPI contract summary', () => {
  it('counts paths, operations and component schemas', () => {
    expect(
      summarizeOpenApi({
        paths: {
          '/patients': { get: {}, post: {}, parameters: [] },
          '/patients/{id}': { get: {}, patch: {} },
        },
        components: { schemas: { Patient: {}, ErrorResponse: {} } },
      }),
    ).toEqual({ paths: 2, operations: 4, schemas: 2 })
  })
})
