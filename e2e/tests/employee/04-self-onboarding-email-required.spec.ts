import { test, expect } from '../../utils/localTestFixture'
import { fillDate, generateUniqueSSN, waitForLoadingComplete } from '../../utils/helpers'

const LONG_WAIT = 90_000

/**
 * SDK-1000 (v2026-02-01 upgrade): the self-onboarding employee-create
 * endpoint now rejects payloads without an `email` field at the server.
 *
 * The SDK's Zod schema in `employeeDetailsSchema.ts:128` already enforces
 * email-required when the admin toggles the self-onboarding switch on
 * create. This spec drives the admin employee-create form against Demo:
 *
 *   1. Navigate to the employee-onboarding home
 *   2. Click Add Employee → land on Basics
 *   3. Fill every required field EXCEPT email
 *   4. Toggle on "Invite this employee to enter their own details online."
 *      (the self-onboarding switch — backed by useEmployeeDetailsForm's
 *      `selfOnboarding` field)
 *   5. Click Continue and assert client-side validation blocks the
 *      submission before the request is sent
 *
 * If this test starts failing, it means our client-side defense against
 * the new server-side rejection has broken — we'd hit a server 422
 * instead of a friendlier inline error.
 */
test.describe('EmployeeOnboarding - self-onboarding email required (SDK-1000)', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('blocks Continue on the admin Basics form when self-onboarding is enabled without email', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(2 * 60_000)

    await page.goto('/?flow=employee-onboarding')
    await waitForLoadingComplete(page, {
      timeout: LONG_WAIT,
      anchor: page.getByRole('heading', { name: /your employees/i }),
    })

    const addButton = page.getByRole('button', { name: /^add( an| another)? employee$/i }).first()
    await expect(addButton).toBeVisible({ timeout: 30_000 })
    await addButton.click()
    await waitForLoadingComplete(page, LONG_WAIT)

    await expect(page.getByRole('heading', { name: /^basics$/i })).toBeVisible({ timeout: 30_000 })

    // Fill every required field on Basics EXCEPT email.
    const firstName = `SelfOn${Date.now()}`
    await page.getByLabel(/legal first name/i).fill(firstName)
    await page.getByLabel(/legal last name/i).fill('NoEmail')
    await page.getByLabel(/social security number/i).fill(generateUniqueSSN())
    await fillDate(page, 'Date of birth', { month: 4, day: 15, year: 1992 })
    await fillDate(page, 'Start date', { month: 1, day: 15, year: 2025 })

    // Work address — pick HQ (only option on shared/onboarded).
    await page.getByRole('button', { name: /work address/i }).click()
    await page.getByRole('listbox').getByRole('option').first().click()

    // Home address.
    await page.getByLabel('Street 1').fill('425 California St')
    await page.getByLabel(/city/i).fill('San Francisco')
    await page.getByLabel('State').click()
    await page.getByRole('listbox').getByRole('option', { name: 'California' }).click()
    const zipField = page.getByLabel(/zip/i)
    await zipField.clear()
    await zipField.fill('94104')

    // Toggle self-onboarding ON. Email is now required by Zod (and by the
    // v2026-02-01 server contract).
    const selfOnboardingSwitch = page.getByRole('switch', {
      name: /invite this employee to enter their own details online/i,
    })
    await expect(selfOnboardingSwitch).toBeVisible({ timeout: 10_000 })
    await selfOnboardingSwitch.click()

    // Submit — Zod should block.
    await page.getByRole('button', { name: /^continue$/i }).click()

    // We must still be on Basics. If validation passed, the SDK would have
    // navigated forward to Compensation.
    await expect(page.getByRole('heading', { name: /^basics$/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /^compensation$/i })).toHaveCount(0)

    // Inline required-field surface near the email input.
    await expect(page.getByLabel(/personal email/i)).toBeVisible({ timeout: 5_000 })
  })
})
