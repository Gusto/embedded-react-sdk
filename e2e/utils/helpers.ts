import { randomInt } from 'node:crypto'
import type { Locator, Page } from '@playwright/test'

export function generateUniqueSSN(): string {
  const area = randomInt(1, 666)
  const group = randomInt(1, 99)
  const serial = randomInt(1, 9999)
  return `${area.toString().padStart(3, '0')}${group.toString().padStart(2, '0')}${serial.toString().padStart(4, '0')}`
}

export function generateUniqueEIN(): string {
  const prefix = randomInt(10, 100)
  const suffix = randomInt(1000000, 10000000)
  return `${prefix}-${suffix}`
}

export async function fillDate(
  page: Page,
  name: string,
  date: { month: number; day: number; year: number },
) {
  // Anchored at the start so the matcher won't catch sibling segments when
  // the group name itself contains "day" / "month" / "year" (e.g. "Last day
  // of work", "Birthday"). React Aria's spinbutton accessible names are
  // "month, <group>", "day, <group>", "year, <group>" — so /^month/ etc.
  // uniquely identifies each segment.
  const dateGroup = page.getByRole('group', { name })
  await dateGroup.getByRole('spinbutton', { name: /^month/i }).fill(String(date.month))
  await dateGroup.getByRole('spinbutton', { name: /^day/i }).fill(String(date.day))
  await dateGroup.getByRole('spinbutton', { name: /^year/i }).fill(String(date.year))
}

/**
 * Wait for the SDK's top-level Suspense fallback (`<Loading>` region with
 * `aria-label` = `common:status.loading` = "Loading component...") to detach.
 *
 * Two call shapes:
 *
 *   await waitForLoadingComplete(page, 60_000)
 *   await waitForLoadingComplete(page, { timeout: 60_000, anchor: heading })
 *
 * The two-arg form waits only for the Suspense region to detach. The options
 * form additionally waits for `anchor` to be visible — use it whenever the
 * caller's *next* step is `expect(landmark).toBeVisible()`, so the wait and
 * the assertion share one budget instead of two and a stuck page fails on the
 * landmark, not on a generic timeout.
 *
 * If the loading region never detaches within `timeout`, this function throws
 * (it used to swallow that error, which caused downstream `expect` calls to
 * race against half-rendered pages and produce misleading "element not found"
 * failures 30s later). The previous behavior is preserved by always waiting on
 * `.first()` so multiple Suspense regions don't deadlock the helper.
 */
// US federal holidays that the demo backend's "business day" validation
// rejects for direct-deposit payment dates. Only encoding dates that the
// canary specs could realistically hit (current calendar year + the next
// one to cover roll-over). Revisit this list each January.
//
// TODO(2027): refresh entries; remove 2026 once it's fully in the past.
const US_FEDERAL_HOLIDAYS_ISO: ReadonlySet<string> = new Set([
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Day
  '2026-02-16', // Presidents Day
  '2026-05-25', // Memorial Day
  '2026-06-19', // Juneteenth
  '2026-07-03', // Independence Day (observed, July 4 is Saturday)
  '2026-09-07', // Labor Day
  '2026-10-12', // Columbus Day
  '2026-11-11', // Veterans Day
  '2026-11-26', // Thanksgiving
  '2026-11-27', // Day after Thanksgiving (banking holiday)
  '2026-12-25', // Christmas Day
  '2027-01-01', // New Year's Day
  '2027-01-18', // MLK Day
  '2027-02-15', // Presidents Day
  '2027-05-31', // Memorial Day
  '2027-06-18', // Juneteenth (observed, June 19 is Saturday)
  '2027-07-05', // Independence Day (observed, July 4 is Sunday)
  '2027-09-06', // Labor Day
  '2027-10-11', // Columbus Day
  '2027-11-11', // Veterans Day
  '2027-11-25', // Thanksgiving
  '2027-11-26', // Day after Thanksgiving
  '2027-12-24', // Christmas Day (observed, Dec 25 is Saturday)
])

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function isBusinessDay(date: Date): boolean {
  const day = date.getUTCDay()
  if (day === 0 || day === 6) return false
  return !US_FEDERAL_HOLIDAYS_ISO.has(toIsoDate(date))
}

/**
 * Return the first business day (weekday + not a US federal holiday) that is
 * at least `minOffsetDays` after `from`. Operates in UTC to keep results
 * stable regardless of the test runner's local timezone — the demo backend
 * also validates against UTC dates.
 *
 * Designed for payment / pay-date pickers where the backend rejects
 * non-business days. Without this, a +14 offset that lands on Memorial Day
 * surfaces as a non-actionable form-validation alert in CI.
 */
export function nextBusinessDay(from: Date, minOffsetDays: number): Date {
  const candidate = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + minOffsetDays),
  )
  while (!isBusinessDay(candidate)) {
    candidate.setUTCDate(candidate.getUTCDate() + 1)
  }
  return candidate
}

interface WaitForLoadingOptions {
  timeout?: number
  anchor?: Locator
}

export async function waitForLoadingComplete(
  page: Page,
  timeoutOrOptions: number | WaitForLoadingOptions = 30_000,
): Promise<void> {
  const { timeout = 30_000, anchor } =
    typeof timeoutOrOptions === 'number' ? { timeout: timeoutOrOptions } : timeoutOrOptions

  const suspenseFallback = page.getByRole('region', { name: /^loading/i }).first()
  const detach = suspenseFallback.waitFor({ state: 'detached', timeout })

  if (anchor) {
    await Promise.all([detach, anchor.waitFor({ state: 'visible', timeout })])
    return
  }

  await detach
}

export async function skipPendingPayrolls(config: { flowToken: string; companyId: string }) {
  const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST || 'https://flows.gusto-demo.com'
  const base = `${gwsFlowsHost}/fe_sdk/${config.flowToken}/v1`

  let payrolls: Array<{
    pay_period: { start_date: string; end_date: string; pay_schedule_uuid: string }
    payroll_type?: string
  }>
  try {
    const listResponse = await fetch(
      `${base}/companies/${config.companyId}/payrolls?processing_statuses=unprocessed`,
    )
    if (!listResponse.ok) return
    payrolls = await listResponse.json()
  } catch {
    return
  }

  for (const payroll of payrolls) {
    try {
      await fetch(`${base}/companies/${config.companyId}/payrolls/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payroll_type: payroll.payroll_type ?? 'Regular',
          start_date: payroll.pay_period.start_date,
          end_date: payroll.pay_period.end_date,
          pay_schedule_uuid: payroll.pay_period.pay_schedule_uuid,
        }),
      })
    } catch {
      // continue skipping remaining payrolls
    }
  }
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
