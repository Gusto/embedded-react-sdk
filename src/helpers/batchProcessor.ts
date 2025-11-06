export const DEFAULT_BATCH_SIZE = 100

export function splitIntoBatches<T>(items: T[], batchSize: number = DEFAULT_BATCH_SIZE): T[][] {
  if (batchSize <= 0) {
    throw new Error('Batch size must be greater than 0')
  }

  if (items.length === 0) {
    return []
  }

  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  return batches
}

export async function processBatches<T, R>(
  items: T[],
  processFn: (batch: T[]) => Promise<R>,
  batchSize: number = DEFAULT_BATCH_SIZE,
): Promise<R[]> {
  const batches = splitIntoBatches(items, batchSize)
  const results: R[] = []

  for (const batch of batches) {
    const result = await processFn(batch)
    results.push(result)
  }

  return results
}
