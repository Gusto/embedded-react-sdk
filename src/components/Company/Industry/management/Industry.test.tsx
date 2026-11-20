import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Industry } from './Industry'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'

/**
 * Selecting an industry renders all 1012 bundled combo box options, which overruns the 5s
 * default under parallel load. Same allowance the onboarding suite makes.
 */
const COMBO_BOX_INTERACTION_TIMEOUT = 20000

const SAVED_INDUSTRY = {
  naicsCode: '541511',
  apiTitle: 'Custom Computer Programming Services',
  comboBoxLabel: /^Custom Computer Programming Services\s*$/,
}
const OTHER_INDUSTRY = {
  naicsCode: '111310',
  apiTitle: 'Orange Groves',
  comboBoxLabel: 'Orange Groves',
}

const unstableFeatures = { companySettingsDashboard: true }

function industryBody(naicsCode: string, title: string) {
  return { company_uuid: COMPANY_ID, naics_code: naicsCode, title, sic_codes: ['7371'] }
}

function setupIndustryHandlers() {
  server.use(
    http.get(`${API_BASE_URL}/v1/companies/:company_id/industry_selection`, () =>
      HttpResponse.json(industryBody(SAVED_INDUSTRY.naicsCode, SAVED_INDUSTRY.apiTitle)),
    ),
    http.put(`${API_BASE_URL}/v1/companies/:company_id/industry_selection`, () =>
      HttpResponse.json(industryBody(OTHER_INDUSTRY.naicsCode, OTHER_INDUSTRY.apiTitle), {
        status: 201,
      }),
    ),
  )
}

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Edit industry' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Edit industry' }))
}

describe('CompanyManagement.Industry', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    setupIndustryHandlers()
  })

  it('renders the SDK error card instead of the block without the companySettingsDashboard flag', async () => {
    // The flag check throws above BaseBoundaries; GustoProvider's top-level ErrorBoundary
    // catches it and renders InternalError in place of the block.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit industry' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('opens on the card', async () => {
    renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />, { unstableFeatures })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit industry' })).toBeEnabled()
    })
    expect(screen.getByText(SAVED_INDUSTRY.apiTitle)).toBeInTheDocument()
  })

  it('returns from the editor to the card via its own back header, not a generic cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />, { unstableFeatures })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: 'Back to industry' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit industry' })).toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_CANCELLED,
      undefined,
    )
  })

  it(
    'saves, raises both the onboarding and management events, and shows a dismissible alert',
    async () => {
      const user = userEvent.setup()
      renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />, {
        unstableFeatures,
      })

      await openEditor(user)

      const comboBox = await screen.findByRole('combobox', {
        name: "Select your company's industry",
      })
      await waitFor(() => {
        expect(comboBox).toHaveDisplayValue(SAVED_INDUSTRY.comboBoxLabel)
      })
      await user.clear(comboBox)
      await user.type(comboBox, OTHER_INDUSTRY.comboBoxLabel)
      await user.click(await screen.findByRole('option', { name: OTHER_INDUSTRY.comboBoxLabel }))

      // The editor is the onboarding industry form, whose terminal CTA still reads
      // "Continue". Management-flavoured copy is a separate, pre-existing gap — the
      // dashboard's industry spoke shows the same label today.
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.COMPANY_MANAGEMENT_INDUSTRY_UPDATED,
          expect.anything(),
        )
      })
      // The wrapper adds a signal rather than replacing one, so a partner listening for the
      // onboarding event keeps hearing it.
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.COMPANY_INDUSTRY_SELECTED,
        expect.anything(),
      )

      expect(await screen.findByText('Industry updated.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit industry' })).toBeInTheDocument()
    },
    COMBO_BOX_INTERACTION_TIMEOUT,
  )
})
