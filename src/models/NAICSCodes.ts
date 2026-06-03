/**
 * Lazily loads the full NAICS industry code list as `{ code, title }` records.
 *
 * @returns A promise resolving to every NAICS code paired with its title.
 * @internal
 */
export const loadAll = async () =>
  (await import('./NAICSValues')).default.map(row => ({ code: row[0], title: row[1] }))
