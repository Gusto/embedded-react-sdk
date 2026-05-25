import { test, expect } from '../../../utils/localTestFixture'
import {
  addAnotherLocation,
  advancePastLocations,
  clickStartOrContinueOnboarding,
  expectOnLocationsList,
  landOnCompanyOnboarding,
} from '../../../utils/companyFlowDrivers'

test.describe.serial('CompanyCanary 02 — locations: add another address', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/fresh-wizard',
    })
  })

  test('adds a second location through the SDK form and then continues past Company addresses', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await landOnCompanyOnboarding(page)
    await clickStartOrContinueOnboarding(page)
    await expectOnLocationsList(page)

    await addAnotherLocation(page, {
      street1: '221 Broadway',
      city: 'Oakland',
      state: 'California',
      zip: '94607',
      phone: '5105551234',
    })

    await expect(page.getByText(/oakland/i).first()).toBeVisible({ timeout: 15_000 })

    await advancePastLocations(page)
  })
})
