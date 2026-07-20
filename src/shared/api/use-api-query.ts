'use client'

import { useQuery } from '@tanstack/react-query'
import { apiRequest, type ApiRequestOptions } from './client'

export function useApiQuery<T>(key: readonly unknown[], path: string, options?: ApiRequestOptions) {
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiRequest<T>(path, { ...options, signal }),
  })
}
