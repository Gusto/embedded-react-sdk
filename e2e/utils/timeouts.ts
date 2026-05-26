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
 *
 * Sized for a slow demo backend (flows.gusto-demo.com): a single navigation
 * round-trip plus React render can take 20-40s under load. 60s gives a 1.5x
 * margin so a single slow request doesn't fail an otherwise-healthy test.
 */
export const SDK_NAVIGATION_DEADLINE = 60_000

/**
 * Upper bound for payroll calculation, submission, and receipt round-trips.
 * The backend computes withholdings, taxes, and direct-deposit batches
 * synchronously on these calls; real demo runs have been observed at 30-60s
 * under load, occasionally longer when the demo is under heavy load.
 */
export const PAYROLL_CALCULATION_DEADLINE = 90_000

/**
 * Whole-test ceiling for canary specs that drive a single payroll flow
 * (regular, off-cycle bonus, off-cycle correction). Sized to cover landing
 * → calculate → submit → receipt with comfortable margin for slow demo
 * responses. A healthy canary today completes well under 4 min against
 * the demo backend; 6 min keeps margin for slow demo runs.
 */
export const CANARY_TEST_TIMEOUT_MS = 6 * 60_000

/**
 * Whole-test ceiling for canaries that perform additional setup before
 * driving the payroll flow (transition payroll changes the pay schedule
 * first; dismissal payroll terminates an employee first). 10 min = the
 * 6-min single-flow budget plus ~4 min of headroom for the precursor
 * step's own round-trips, which themselves run against the same slow
 * demo backend.
 */
export const CANARY_TEST_TIMEOUT_WITH_PRECURSOR_MS = 10 * 60_000
