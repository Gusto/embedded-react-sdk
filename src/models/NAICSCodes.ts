export const loadAll = async () =>
  (await import('./NAICSValues')).default.map(row => ({ code: row[0], title: row[1] }))
