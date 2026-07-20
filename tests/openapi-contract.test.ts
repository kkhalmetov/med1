import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

  it('allows zero discomfort in the current report contract', () => {
    const contract = JSON.parse(
      readFileSync(join(process.cwd(), 'openapi/qadam.json'), 'utf8'),
    ) as {
      components: {
        schemas: {
          QuestionnaireResponseCreateRequest: {
            properties: { discomfortLevel: { minimum: number; maximum: number } }
          }
        }
      }
    }
    expect(
      contract.components.schemas.QuestionnaireResponseCreateRequest.properties.discomfortLevel,
    ).toMatchObject({ minimum: 0, maximum: 10 })
  })
})
