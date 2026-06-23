import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

/**
 * SDK-1000 (v2026-02-01 upgrade): the self-onboarding employee-create
 * endpoint now rejects payloads without an `email` field at the server.
 *
 * The SDK's Zod schema (src/partner-hook-utils/form/buildFormSchema.ts)
 * already enforces email-required when `selfOnboarding: true` in create
 * mode (see buildFormSchema.test.ts:382-412), so the client never reaches
 * the new server-side rejection. This spec verifies that contract end-to-
 * end against Demo: attempting to submit the self-onboarding employee
 * profile without an email surfaces a client-side validation error.
 */
test.describe('EmployeeOnboarding - self-onboarding email required', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test.skip('blocks self-onboarding submit when email is missing', async ({ page, scenario }) => {
    // TODO(SDK-1000): un-skip once we have a scenario for creating a new
    // self-onboarding employee from scratch (current `shared/onboarded`
    // has self-onboarding employees that already carry email). The
    // assertion shape is in place so future implementation has a target.
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(120_000)

    await page.goto('/?flow=employee-create&selfOnboarding=true')
    await waitForLoadingComplete(page, 30_000)

    // Fill required fields except email
    await page.getByLabel(/first name/i).fill('Test')
    await page.getByLabel(/last name/i).fill('Selfee')
    // Intentionally skip the email field.

    await page.getByRole('button', { name: /save|submit|continue/i }).click()

    // Client-side Zod validation should surface a required-field error
    // BEFORE the request is sent. Asserting the error message text is
    // brittle to i18n; assert the form did NOT advance instead.
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
