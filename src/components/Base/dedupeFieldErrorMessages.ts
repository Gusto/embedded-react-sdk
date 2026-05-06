/**
 * Collapses identical error messages into a single entry with a count.
 *
 * The Gusto API returns one field error per offending record (e.g. one per
 * employee in a bulk operation). When all the records fail the same way, the
 * UI rendered N copies of the same string. This preserves order of first
 * occurrence and aggregates exact-match duplicates.
 */
export interface DedupedErrorMessage {
  message: string
  count: number
}

export function dedupeFieldErrorMessages(messages: string[]): DedupedErrorMessage[] {
  const indexByMessage = new Map<string, number>()
  const result: DedupedErrorMessage[] = []

  for (const message of messages) {
    if (!message) continue
    const existingIndex = indexByMessage.get(message)
    if (existingIndex === undefined) {
      indexByMessage.set(message, result.length)
      result.push({ message, count: 1 })
    } else {
      result[existingIndex]!.count += 1
    }
  }

  return result
}
