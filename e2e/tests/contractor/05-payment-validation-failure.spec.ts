import { test, expect } from '../../utils/localTestFixture'
import { fillDate, waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorPaymentFlow - submit payment lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('opens Pay contractors, attempts continue without payments, and surfaces validation', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    await page.goto('/?flow=contractor-payment')
    await waitForLoadingComplete(page, 60000)

    await page
      .getByRole('button', { name: /new payment/i })
      .first()
      .click()
    await waitForLoadingComplete(page, 60000)

    const composition = page.getByRole('heading', { name: /pay contractors/i })
    const empty = page.getByRole('heading', { name: /no contractors available/i })
    await expect(composition.or(empty)).toBeVisible({ timeout: 30000 })

    if (await empty.isVisible().catch(() => false)) {
      test.skip(true, 'No contractors provisioned — skipping payment flow')
      return
    }

    const dateGroup = page.getByRole('group', { name: /payment date/i })
    await expect(dateGroup).toBeVisible()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    await fillDate(page, 'Payment date', {
      month: futureDate.getMonth() + 1,
      day: futureDate.getDate(),
      year: futureDate.getFullYear(),
    })

    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, 30000)

    await expect(
      page.getByRole('alert', { name: /please add at least one contractor payment/i }),
    ).toBeVisible({ timeout: 15000 })
  })
})
