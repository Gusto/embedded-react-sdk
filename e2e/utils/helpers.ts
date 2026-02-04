import type { Page } from '@playwright/test'

export async function fillDate(
  page: Page,
  name: string,
  date: { month: number; day: number; year: number },
) {
  const dateGroup = page.getByRole('group', { name })
  await dateGroup.getByRole('spinbutton', { name: /month/i }).fill(String(date.month))
  await dateGroup.getByRole('spinbutton', { name: /day/i }).fill(String(date.day))
  await dateGroup.getByRole('spinbutton', { name: /year/i }).fill(String(date.year))
}
