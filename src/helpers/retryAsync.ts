interface RetryAsyncOptions {
  maxAttempts: number
  delayMs: number
  shouldRetry: (error: unknown) => boolean
}

/**
 * Retries an async function up to a maximum number of attempts, with a fixed delay between tries.
 *
 * The function is invoked at least once. After a failure, `shouldRetry` decides whether to retry;
 * if it returns false the error is rethrown immediately. Errors from the final attempt are always
 * rethrown.
 *
 * @typeParam T - The resolved value type of the async function.
 * @param fn - The async function to invoke.
 * @param options - Retry configuration: `maxAttempts`, `delayMs` between attempts, and a `shouldRetry` predicate.
 * @returns The resolved value from the first successful call.
 * @throws The error from the final attempt, or the first error for which `shouldRetry` returns false.
 * @internal
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  { maxAttempts, delayMs, shouldRetry }: RetryAsyncOptions,
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts - 1
      if (shouldRetry(error) && !isLastAttempt) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }
      throw error
    }
  }

  throw new Error('retryAsync: exhausted all attempts without resolving')
}
