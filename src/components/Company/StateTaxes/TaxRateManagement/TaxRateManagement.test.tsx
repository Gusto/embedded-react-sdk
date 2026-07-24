import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver, type RequestHandler } from 'msw'
import { TaxRateManagement } from './TaxRateManagement'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

function renderTaxRateManagement(onEvent = vi.fn(), extraHandlers: RequestHandler[] = []) {
  setupApiTestMocks()
  server.use(...extraHandlers)
  render(
    <GustoTestProvider>
      <TaxRateManagement companyId="company-123" state="GA" onEvent={onEvent} />
    </GustoTestProvider>,
  )
  return { onEvent }
}

describe('TaxRateManagement', () => {
  it('renders one history section per effective-dated key, excluding non-dated sections', async () => {
    renderTaxRateManagement()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tax Rates' })).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Deposit Schedules' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Registrations' })).not.toBeInTheDocument()
  })

  it('tags the only effective-dated set for a key as "Current"', async () => {
    renderTaxRateManagement()

    const section = await screen.findByRole('region', { name: 'Tax Rates' })
    expect(within(section).getByText('Current')).toBeInTheDocument()
  })

  it('fires CANCEL when the back button is clicked', async () => {
    const { onEvent } = renderTaxRateManagement()
    const user = userEvent.setup()

    const backButton = await screen.findByRole('button', { name: 'Back to states' })
    await user.click(backButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
  })

  describe('when the state has exactly one effective-dated key', () => {
    function renderSingleGroup(onEvent = vi.fn()) {
      return renderTaxRateManagement(onEvent, [
        http.get(
          `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
          ({ request }) => {
            const scheduling = new URL(request.url).searchParams.get('scheduling') === 'true'
            if (scheduling) {
              return HttpResponse.json({ company_uuid: 'x', state: 'GA', requirement_sets: [] })
            }
            return HttpResponse.json({
              company_uuid: 'x',
              state: 'GA',
              requirement_sets: [
                {
                  state: 'GA',
                  key: 'taxrates',
                  label: 'Tax Rates',
                  effective_from: '2022-01-01',
                  requirements: [
                    { key: 'rate', label: 'Total Tax Rate', value: '0.05', editable: true },
                  ],
                },
              ],
            })
          },
        ),
      ])
    }

    it('disables "Add tax rate" when there are no schedulable candidates', async () => {
      renderSingleGroup()

      const addRateButton = await screen.findByRole('button', { name: 'Add tax rate' })
      expect(addRateButton).toBeDisabled()
    })

    it('shows only the page-level heading, no duplicate per-group heading', async () => {
      renderSingleGroup()

      expect(
        await screen.findByRole('heading', { name: 'Tax rates for Georgia' }),
      ).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Tax Rates' })).not.toBeInTheDocument()
      expect(
        screen.getByText('Effective-dated tax rate history and scheduled future rates.'),
      ).toBeInTheDocument()
    })

    it('renders "Add tax rate" as a primary action outside the history table region', async () => {
      renderSingleGroup()

      const addRateButton = await screen.findByRole('button', { name: 'Add tax rate' })
      expect(addRateButton).toHaveAttribute('data-variant', 'primary')

      const section = await screen.findByRole('region', { name: 'Tax Rates' })
      expect(
        within(section).queryByRole('button', { name: 'Add tax rate' }),
      ).not.toBeInTheDocument()
    })
  })

  it('tags historical/current/scheduled sets correctly across three dated sets for the same key', async () => {
    renderTaxRateManagement(vi.fn(), [
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
        ({ request }) => {
          const scheduling = new URL(request.url).searchParams.get('scheduling') === 'true'
          if (scheduling) {
            return HttpResponse.json({ company_uuid: 'x', state: 'GA', requirement_sets: [] })
          }
          return HttpResponse.json({
            company_uuid: 'x',
            state: 'GA',
            requirement_sets: [
              {
                state: 'GA',
                key: 'taxrates',
                label: 'Tax Rates',
                effective_from: '2020-01-01',
                requirements: [
                  { key: 'rate', label: 'Total Tax Rate', value: '0.03', editable: true },
                ],
              },
              {
                state: 'GA',
                key: 'taxrates',
                label: 'Tax Rates',
                effective_from: '2022-01-01',
                requirements: [
                  { key: 'rate', label: 'Total Tax Rate', value: '0.05', editable: true },
                ],
              },
              {
                state: 'GA',
                key: 'taxrates',
                label: 'Tax Rates',
                effective_from: '2099-01-01',
                requirements: [
                  { key: 'rate', label: 'Total Tax Rate', value: '0.06', editable: true },
                ],
              },
            ],
          })
        },
      ),
    ])

    const section = await screen.findByRole('region', { name: 'Tax Rates' })
    expect(within(section).getByText('Historical')).toBeInTheDocument()
    expect(within(section).getByText('Current')).toBeInTheDocument()
    expect(within(section).getByText('Scheduled')).toBeInTheDocument()
  })

  it('schedules a new tax rate with the chosen future effective date', async () => {
    let putBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      putBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({})
    })
    renderTaxRateManagement(vi.fn(), [
      http.put(`${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`, updateResolver),
    ])
    const user = userEvent.setup()

    const section = await screen.findByRole('region', { name: 'Tax Rates' })
    const addRateButton = within(section).getByRole('button', { name: 'Add tax rate' })
    expect(addRateButton).toBeEnabled()
    await user.click(addRateButton)

    const dialog = await screen.findByRole('dialog')
    // The only schedulable candidate (2027-01-01) is pre-selected by default.
    expect(within(dialog).getByLabelText(/Effective date/i)).toHaveTextContent('January 1, 2027')

    const rateField = within(dialog).getByLabelText(/Total Tax Rate/i)
    await user.clear(rateField)
    await user.type(rateField, '6')

    const saveButton = within(dialog).getByRole('button', { name: 'Save tax rate' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(putBody).toMatchObject({
      requirement_sets: [
        {
          state: 'GA',
          key: 'taxrates',
          effective_from: '2027-01-01',
          requirements: [{ key: 'e0ac2284-8d30-4100-ae23-f85f9574868b', value: '0.06' }],
        },
      ],
    })

    expect(
      await screen.findByText('Tax rate scheduled to take effect on January 1, 2027.'),
    ).toBeInTheDocument()
  })

  it('dismisses the success alert when its dismiss control is used', async () => {
    renderTaxRateManagement(vi.fn(), [
      http.put(`${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`, () =>
        HttpResponse.json({}),
      ),
    ])
    const user = userEvent.setup()

    const section = await screen.findByRole('region', { name: 'Tax Rates' })
    await user.click(within(section).getByRole('button', { name: 'Add tax rate' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Save tax rate' }))

    await screen.findByText('Tax rate scheduled to take effect on January 1, 2027.')
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(
      screen.queryByText('Tax rate scheduled to take effect on January 1, 2027.'),
    ).not.toBeInTheDocument()
  })

  it('renders requirements that share the same key as independent fields, not a linked pair', async () => {
    const captured: {
      body: { requirement_sets: { requirements: { key: string; value: string }[] }[] } | null
    } = { body: null }
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      captured.body = (await request.json()) as typeof captured.body
      return HttpResponse.json({})
    })
    renderTaxRateManagement(vi.fn(), [
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`,
        ({ request }) => {
          const scheduling = new URL(request.url).searchParams.get('scheduling') === 'true'
          const fieldA = {
            key: 'dup-key',
            label: 'Field A',
            value: 'A-value',
            editable: true,
            metadata: { type: 'text' },
          }
          const fieldB = {
            key: 'dup-key',
            label: 'Field B',
            value: 'B-value',
            editable: true,
            metadata: { type: 'text' },
          }
          return HttpResponse.json({
            company_uuid: 'x',
            state: 'GA',
            requirement_sets: [
              {
                state: 'GA',
                key: 'taxrates',
                label: 'Tax Rates',
                effective_from: scheduling ? '2027-01-01' : '2022-01-01',
                // Two distinct questions sharing the same upstream `key` — the API doesn't
                // guarantee uniqueness within a set, so the SDK must disambiguate on its own.
                requirements: scheduling ? [fieldA, fieldB] : [fieldA],
              },
            ],
          })
        },
      ),
      http.put(`${API_BASE_URL}/v1/companies/:company_id/tax_requirements/:state`, updateResolver),
    ])
    const user = userEvent.setup()

    const addRateButton = await screen.findByRole('button', { name: 'Add tax rate' })
    await user.click(addRateButton)

    const dialog = await screen.findByRole('dialog')
    const fieldAInput = within(dialog).getByLabelText('Field A')
    const fieldBInput = within(dialog).getByLabelText('Field B')
    expect(fieldAInput).not.toBe(fieldBInput)

    await user.clear(fieldAInput)
    await user.type(fieldAInput, 'A-edited')
    expect(fieldBInput).toHaveValue('B-value')

    await user.clear(fieldBInput)
    await user.type(fieldBInput, 'B-edited')
    expect(fieldAInput).toHaveValue('A-edited')

    const saveButton = within(dialog).getByRole('button', { name: 'Save tax rate' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(captured.body?.requirement_sets[0]?.requirements).toHaveLength(2)
    expect(captured.body?.requirement_sets[0]?.requirements).toEqual(
      expect.arrayContaining([
        { key: 'dup-key', value: 'A-edited' },
        { key: 'dup-key', value: 'B-edited' },
      ]),
    )
  })
})
