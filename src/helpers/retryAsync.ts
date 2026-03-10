interface RetryAsyncOptions {
  maxAttempts: number
  delayMs: number
  shouldRetry: (error: unknown) => boolean
}

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
