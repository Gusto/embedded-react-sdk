import type { Page } from '@playwright/test'

// noboost: Math.random() is fine here — these are fake SSNs for e2e test form fills, not real secrets
export function generateUniqueSSN(): string {
  const area = Math.floor(Math.random() * 665) + 1 // noboost
  const group = Math.floor(Math.random() * 98) + 1 // noboost
  const serial = Math.floor(Math.random() * 9998) + 1 // noboost
  return `${area.toString().padStart(3, '0')}${group.toString().padStart(2, '0')}${serial.toString().padStart(4, '0')}`
}

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

export async function waitForLoadingComplete(page: Page, timeout = 60000) {
  const startTime = Date.now()
  let consecutiveNonLoadingChecks = 0
  const requiredConsecutiveChecks = 3

  while (Date.now() - startTime < timeout) {
    const loadingRegion = page.getByRole('region', { name: /loading/i })
    const loadingText = page.getByText(/loading/i)
    const spinner = page.locator('[class*="spinner"], [class*="loading"], [aria-busy="true"]')
    const skeletonLoader = page.locator('[class*="skeleton"], [class*="placeholder"]')

    const isLoadingVisible =
      (await loadingRegion.isVisible().catch(() => false)) ||
      (await loadingText.isVisible().catch(() => false)) ||
      (await spinner
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await skeletonLoader
        .first()
        .isVisible()
        .catch(() => false))

    if (!isLoadingVisible) {
      consecutiveNonLoadingChecks++
      if (consecutiveNonLoadingChecks >= requiredConsecutiveChecks) {
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
        await page.waitForTimeout(300)
        return
      }
    } else {
      consecutiveNonLoadingChecks = 0
    }

    await page.waitForTimeout(200)
  }

  throw new Error(`Loading did not complete within ${timeout}ms`)
}

export async function waitForContentOrLoading(
  page: Page,
  contentLocator: ReturnType<Page['getByRole']>,
  timeout = 60000,
) {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const isContentVisible = await contentLocator.isVisible().catch(() => false)
    if (isContentVisible) {
      return
    }

    const loadingRegion = page.getByRole('region', { name: /loading/i })
    const isLoading = await loadingRegion.isVisible().catch(() => false)

    if (!isLoading) {
      await contentLocator.waitFor({ timeout: 5000 }).catch(() => {})
      return
    }

    await page.waitForTimeout(200)
  }

  throw new Error(`Content did not appear within ${timeout}ms`)
}
