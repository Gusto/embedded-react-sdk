import { useState, useCallback, useRef } from 'react'
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

  // Use a ref to avoid unnecessary re-renders
  const mutationFnRef = useRef(mutationFn)
  mutationFnRef.current = mutationFn

  const mutateAsync = useCallback(
    async (items: TItem[]): Promise<TResponse[]> => {
      setIsPending(true)

      try {
        return await processBatches(items, mutationFnRef.current, batchSize)
      } finally {
        setIsPending(false)
      }
    },
    [batchSize],
  )

  return {
    mutateAsync,
    isPending,
  }
}
