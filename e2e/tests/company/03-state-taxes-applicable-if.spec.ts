import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('StateTaxesForm — applicable_if conditional visibility', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/state-taxes-wa-id',
    })
  })

  test('WA: rate fields stay hidden until "use default rates" radio toggles to No', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (real-backend CI/local runs)')

    await page.goto('/?flow=state-taxes-form&state=WA')
    await waitForLoadingComplete(page, {
      timeout: 30_000,
      anchor: page.getByRole('heading', { name: /tax rates/i }).first(),
    })

    const useDefaultRadioYes = page.getByRole('radio', { name: /^Yes$/ }).first()
    await expect(useDefaultRadioYes).toBeChecked()

    const uiRateLabel = page.getByText('Unemployment Insurance Rate', { exact: true })
    await expect(uiRateLabel).toHaveCount(0)

    const useDefaultRadioNo = page.getByRole('radio', {
      name: /No, my agency gave me new rates/i,
    })
    await useDefaultRadioNo.check()

    await expect(uiRateLabel).toBeVisible()
  })

  test('ID: rate fields stay visible until "reimbursable employer" radio toggles to Yes', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (real-backend CI/local runs)')

    await page.goto('/?flow=state-taxes-form&state=ID')
    await waitForLoadingComplete(page, {
      timeout: 30_000,
      anchor: page.getByRole('heading', { name: /tax rates/i }).first(),
    })

    const reimbursableRadios = page.getByRole('radio')
    await expect(reimbursableRadios.first()).toBeVisible()

    const uiRateLabel = page.getByText(/UI Contribution Rate/i).first()
    await expect(uiRateLabel).toBeVisible()

    const reimbursableYes = page.getByRole('radio', { name: /^Yes/i }).first()
    await reimbursableYes.check()

    await expect(uiRateLabel).toHaveCount(0)
  })
})
