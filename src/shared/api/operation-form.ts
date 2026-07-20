export interface OperationField {
  name: string
  location: 'path' | 'query' | 'body'
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'file'
  format?: string | undefined
  required: boolean
  enum?: string[] | undefined
  min?: number | undefined
  max?: number | undefined
  minLength?: number | undefined
  pattern?: string | undefined
  multiple?: boolean | undefined
}

export interface OperationDefinition {
  operationId: string
  method: string
  path: string
  contentType?: string | undefined
  kind: 'data' | 'download'
  fields: OperationField[]
}
