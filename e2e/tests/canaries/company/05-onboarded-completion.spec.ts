import { test } from '../../../utils/localTestFixture'
import { assertCompletedOverview } from '../../../utils/companyFlowDrivers'
import { waitForLoadingComplete } from '../../../utils/helpers'

test.describe
  .serial('CompanyCanary 05 — already-onboarded company lands on completion state', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded-canary',
    })
  })

  test('renders the "Nice! We\'ll take it from here." completion overview with a Done button', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page, 60_000)

    await assertCompletedOverview(page)
  })
})
