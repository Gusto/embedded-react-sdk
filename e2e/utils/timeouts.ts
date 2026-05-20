/**
 * Named timeout deadlines for the payroll e2e suite.
 *
 * These are upper bounds, not sleeps. Playwright's `expect(...).toBeVisible({ timeout })`
 * and `locator.waitFor({ timeout })` poll continuously and resolve the moment
 * the condition is true — the number is just how patient we're willing to be
 * before declaring failure. Centralizing the values means we can tune one
 * number per tier instead of 30+ scattered literals, and reviewers can see
 * what each tier represents at a glance.
 *
 * If you find yourself reaching for a duration that doesn't fit one of these
 * tiers, the right move is usually to express the wait condition more
 * precisely (e.g. `expect(a.or(b)).toBeVisible()` instead of probing one
 * branch with a hedge timeout) rather than to add a new tier.
 */

/**
 * Upper bound for waiting on an SDK landmark (heading, button, tab) to
 * render after a navigation, click, or reload. Generous because the demo
 * backend's first-paint latency is uneven, but Playwright resolves the
 * assertion the moment the element appears.
 */
export const SDK_NAVIGATION_DEADLINE = 30_000

/**
 * Upper bound for payroll calculation, submission, and receipt round-trips.
 * The backend computes withholdings, taxes, and direct-deposit batches
 * synchronously on these calls; real demo runs have been observed at 30-45s
 * under load.
 */
export const PAYROLL_CALCULATION_DEADLINE = 60_000

/**
 * Whole-test ceiling for canary specs that drive a single payroll flow
 * (regular, off-cycle bonus, off-cycle correction). Sized to cover landing
 * → calculate → submit → receipt with headroom for slow demo responses.
 */
export const CANARY_TEST_TIMEOUT_MS = 8 * 60_000

/**
 * Whole-test ceiling for canaries that perform additional setup before
 * driving the payroll flow (transition payroll changes the pay schedule
 * first; dismissal payroll terminates an employee first).
 */
export const CANARY_TEST_TIMEOUT_WITH_PRECURSOR_MS = 12 * 60_000
