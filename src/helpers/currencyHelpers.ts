export const dollarsToCents = (dollars: number | null): number | null => {
  if (dollars === null) return null
  return Math.round(dollars * 100)
}

export const centsToDollars = (cents: number | null): number | null => {
  if (cents === null) return null
  return cents / 100
}
