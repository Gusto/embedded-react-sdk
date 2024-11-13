import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './queries/helpers'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: ApiError) => {
        if (failureCount >= 3) return false
        // 4xx errors (excecpt for 429) are unlikely to be fixed by retrying
        if (
          error.statusCode &&
          400 <= error.statusCode &&
          error.statusCode <= 499 &&
          error.statusCode !== 429
        ) {
          return false
        } else {
          return true
        }
      },
    },
  },
})
