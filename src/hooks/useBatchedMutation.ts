import { useState, useCallback } from 'react'
import { processBatches, DEFAULT_BATCH_SIZE } from '@/helpers/batchProcessor'

interface UseBatchedMutationOptions {
  batchSize?: number
}

interface UseBatchedMutationResult<TItem, TResponse> {
  mutateAsync: (items: TItem[]) => Promise<TResponse[]>
  isPending: boolean
}

export function useBatchedMutation<TItem, TResponse>(
  mutationFn: (batch: TItem[]) => Promise<TResponse>,
  options?: UseBatchedMutationOptions,
): UseBatchedMutationResult<TItem, TResponse> {
  const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = useCallback(
    async (items: TItem[]): Promise<TResponse[]> => {
      setIsPending(true)

      try {
        return await processBatches(items, mutationFn, batchSize)
      } finally {
        setIsPending(false)
      }
    },
    [mutationFn, batchSize],
  )

  return {
    mutateAsync,
    isPending,
  }
}
