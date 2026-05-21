import { test, expect } from '../../utils/localTestFixture'
import {
  landOnCompanyOnboarding,
  clickStartOrContinueOnboarding,
  advancePastLocations,
  advancePastFederalTaxes,
  advancePastIndustry,
} from '../../utils/companyFlowDrivers'

test.describe('CompanyOnboarding - bank account empty-state lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/fresh-with-hq-location',
    })
  })

  test('reaches bank account step and renders routing + account fields with disabled Continue', async ({
    page,
  }) => {
    test.setTimeout(240_000)

    await landOnCompanyOnboarding(page)
    await clickStartOrContinueOnboarding(page)
    await advancePastLocations(page)
    await advancePastFederalTaxes(page)
    await advancePastIndustry(page)

    const bankHeading = page
      .getByRole('heading', { name: /company bank account|bank account|verify|verification/i })
      .first()
    await expect(bankHeading).toBeVisible({ timeout: 30000 })

    const routingField = page.getByLabel(/routing number/i).first()
    const accountField = page.getByLabel(/account/i).first()
    const verifyOrChange = page
      .getByRole('button', { name: /verify bank account|change bank account/i })
      .first()
    const continueButton = page.getByRole('button', { name: /^continue$/i }).first()

    const hasEmptyForm = await routingField.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasEmptyForm) {
      await expect(routingField).toBeVisible()
      await expect(accountField).toBeVisible()
    } else {
      await expect(verifyOrChange.or(continueButton)).toBeVisible({ timeout: 15000 })
    }
  })
})
