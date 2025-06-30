import type { MutationHookOptions } from '@gusto/embedded-api/react-query/_types'
import { useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query'

interface UseInvalidateOnSuccessArgs<TData, TVariables> {
  invalidators: ((queryClient: QueryClient) => Promise<unknown>)[]
  mutator: ({
    onSuccess,
  }: Pick<MutationHookOptions, 'onSuccess'>) => UseMutationResult<TData, Error, TVariables>
}

export const useInvalidateOnSuccess = <TData, TVariables>({
  invalidators,
  mutator,
}: UseInvalidateOnSuccessArgs<TData, TVariables>) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = mutator({
    async onSuccess() {
      await Promise.all(invalidators.map(invalidator => invalidator(queryClient)))
    },
  })

  return {
    isPending,
    mutateAsync,
  }
}
