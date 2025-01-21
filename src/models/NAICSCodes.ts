export const findAllCodes = async () =>
  //@ts-expect-error A dynamic import of a CSV file isn't expected to be found by the TS typechecker
  (await import('./naics-2022.csv')).default as { Code: string; Title: string }[]
