import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorOnboardingFlow - cancel mid-onboarding returns to list', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'contractor/contractor-onboarding',
    })
  })

  test('Back to contractors from the profile step returns to the contractor list', async ({
    page,
  }) => {
    test.setTimeout(120_000)

    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page, 30000)

    await page.getByRole('button', { name: /add.*contractor|^add$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /contractor profile/i })).toBeVisible({
      timeout: 30000,
    })

    const backCta = page.getByRole('button', { name: /back to contractors/i }).first()
    await expect(backCta).toBeVisible()
    await backCta.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /^contractors$/i })).toBeVisible({
      timeout: 30000,
    })
  })
})
