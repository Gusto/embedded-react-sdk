import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { Industry } from './Industry'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  buildIndustrySelectionBody,
  handleGetIndustrySelection,
  handleUpdateIndustrySelection,
} from '@/test/mocks/apis/company'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-uuid-123'

const SAVED_INDUSTRY = {
  naicsCode: '541511',
  apiTitle: 'Custom Computer Programming Services',
  /**
   * The combo box renders the `@/models/NAICSValues` label for the code, not the API's `title`.
   * Matched loosely because some titles in that list carry trailing whitespace.
   */
  comboBoxLabel: /^Custom Computer Programming Services\s*$/,
}

const OTHER_INDUSTRY = {
  naicsCode: '111310',
  apiTitle: 'Orange Groves',
  comboBoxLabel: 'Orange Groves',
}

/**
 * `GET`/`PUT /v1/companies/:company_id/industry_selection` return the industry
 * object at the top level of the body (see the `company_industry_selections`
 * rabl view) — the `@gusto/embedded-api` client maps the whole body onto
 * `response.industry`. The `PUT` answers `201 Created`, not `200`.
 */
function industryBody(naicsCode: string, title: string) {
  return {
    company_uuid: COMPANY_ID,
    naics_code: naicsCode,
    title,
    sic_codes: ['7371'],
  }
}

function setupIndustryHandlers(saved = SAVED_INDUSTRY) {
  let updateBody: Record<string, unknown> | null = null

  const getResolver = vi.fn<HttpResponseResolver>(() =>
    HttpResponse.json(industryBody(saved.naicsCode, saved.apiTitle)),
  )

  const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
    updateBody = (await request.json()) as Record<string, unknown>
    const naicsCode = String(updateBody.naics_code)
    return HttpResponse.json(
      industryBody(
        naicsCode,
        naicsCode === OTHER_INDUSTRY.naicsCode ? OTHER_INDUSTRY.apiTitle : saved.apiTitle,
      ),
      { status: 201 },
    )
  })

  server.use(
    http.get(`${API_BASE_URL}/v1/companies/:company_id/industry_selection`, getResolver),
    http.put(`${API_BASE_URL}/v1/companies/:company_id/industry_selection`, updateResolver),
  )

  return { getResolver, updateResolver, getUpdateBody: () => updateBody }
}

function getIndustryComboBox() {
  return screen.getByRole('combobox', { name: "Select your company's industry" })
}

async function waitForSavedIndustryToPrefill(label: RegExp = SAVED_INDUSTRY.comboBoxLabel) {
  await waitFor(() => {
    expect(getIndustryComboBox()).toHaveDisplayValue(label)
  })
}

describe('Industry', () => {
  const user = userEvent.setup()
  const onEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  it('renders the industry form prefilled with the saved NAICS code', async () => {
    setupIndustryHandlers()

    renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByRole('heading', { name: 'Industry' })).toBeInTheDocument()
    expect(
      screen.getByText(/^Select the industry that most closely matches your company's\./),
    ).toBeInTheDocument()
    expect(screen.getByText("Select your company's industry")).toHaveAttribute(
      'data-required',
      'true',
    )
    expect(
      screen.getByPlaceholderText('Type a few letters to search for your industry'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()

    await waitForSavedIndustryToPrefill()
  })

  it('submits the newly selected NAICS code and emits the selected event', async () => {
    const { updateResolver, getUpdateBody } = setupIndustryHandlers()

    renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

    await waitForSavedIndustryToPrefill()

    const comboBox = getIndustryComboBox()
    await user.clear(comboBox)
    await user.type(comboBox, OTHER_INDUSTRY.comboBoxLabel)
    await user.click(await screen.findByRole('option', { name: OTHER_INDUSTRY.comboBoxLabel }))

    await waitFor(() => {
      expect(getIndustryComboBox()).toHaveDisplayValue(OTHER_INDUSTRY.comboBoxLabel)
    })

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(getUpdateBody()).toMatchObject({ naics_code: OTHER_INDUSTRY.naicsCode })

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.COMPANY_INDUSTRY_SELECTED,
        expect.objectContaining({
          companyUuid: COMPANY_ID,
          naicsCode: OTHER_INDUSTRY.naicsCode,
          title: OTHER_INDUSTRY.apiTitle,
          sicCodes: ['7371'],
        }),
      )
    })
  })

  it('re-submits the already saved NAICS code when the selection is left untouched', async () => {
    const { updateResolver, getUpdateBody } = setupIndustryHandlers()

    renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

    await waitForSavedIndustryToPrefill()

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(getUpdateBody()).toMatchObject({ naics_code: SAVED_INDUSTRY.naicsCode })

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.COMPANY_INDUSTRY_SELECTED,
        expect.objectContaining({ naicsCode: SAVED_INDUSTRY.naicsCode }),
      )
    })
  })

  describe('a saved classification outside the bundled six-digit list', () => {
    // Four- and five-digit NAICS codes are valid for the API but have no entry in
    // src/models/NAICSValues.ts, so the title has to come from the API instead.
    const UNLISTED = { naicsCode: '5416', title: 'Business & Technical Consulting Firms' }

    function setupUnlistedHandlers(title: string | null) {
      let updateBody: Record<string, unknown> | null = null

      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          buildIndustrySelectionBody({
            naicsCode: String(updateBody.naics_code),
            title: (updateBody.title as string | undefined) ?? title,
          }),
          { status: 201 },
        )
      })

      server.use(
        handleGetIndustrySelection(() =>
          HttpResponse.json(buildIndustrySelectionBody({ naicsCode: UNLISTED.naicsCode, title })),
        ),
        handleUpdateIndustrySelection(updateResolver),
      )

      return { updateResolver, getUpdateBody: () => updateBody }
    }

    it("displays the API's industry title for the saved short code", async () => {
      setupUnlistedHandlers(UNLISTED.title)

      renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

      await waitFor(() => {
        expect(getIndustryComboBox()).toHaveDisplayValue(UNLISTED.title)
      })
    })

    it('falls back to the code when the API supplies no title', async () => {
      setupUnlistedHandlers(null)

      renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

      await waitFor(() => {
        expect(getIndustryComboBox()).toHaveDisplayValue(`NAICS ${UNLISTED.naicsCode}`)
      })
    })

    it('preserves the short code and its title when submitted untouched', async () => {
      const { updateResolver, getUpdateBody } = setupUnlistedHandlers(UNLISTED.title)

      renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

      await waitFor(() => {
        expect(getIndustryComboBox()).toHaveDisplayValue(UNLISTED.title)
      })

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(getUpdateBody()).toMatchObject({
        naics_code: UNLISTED.naicsCode,
        title: UNLISTED.title,
      })
    })

    it('lets the user replace the short code with a listed industry', async () => {
      const { getUpdateBody } = setupUnlistedHandlers(UNLISTED.title)

      renderWithProviders(<Industry companyId={COMPANY_ID} onEvent={onEvent} />)

      await waitFor(() => {
        expect(getIndustryComboBox()).toHaveDisplayValue(UNLISTED.title)
      })

      const comboBox = getIndustryComboBox()
      await user.clear(comboBox)
      await user.type(comboBox, OTHER_INDUSTRY.comboBoxLabel)
      await user.click(await screen.findByRole('option', { name: OTHER_INDUSTRY.comboBoxLabel }))

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(getUpdateBody()).toEqual({ naics_code: OTHER_INDUSTRY.naicsCode })
      })
    })
  })
})
