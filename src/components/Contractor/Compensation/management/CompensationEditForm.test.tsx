import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { CompensationEditForm } from './CompensationEditForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleUpdateContractor } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

function mockContractor(overrides: Record<string, unknown> = {}) {
  server.use(
    handleGetContractor(() =>
      HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Individual',
        is_active: true,
        version: 'v1',
        wage_type: 'Hourly',
        hourly_rate: '45.00',
        file_new_hire_report: false,
        ...overrides,
      }),
    ),
  )
}

describe('CompensationEditForm', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor()
  })

  it('shows the hourly rate field pre-filled for an Hourly contractor', async () => {
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByLabelText('Hourly')).toBeChecked()
    expect(screen.getByLabelText('Hourly rate')).toHaveValue('45.00')
  })

  it('hides the hourly rate field when Fixed is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByLabelText('Hourly')
    await user.click(screen.getByLabelText('Fixed'))

    await waitFor(() => {
      expect(screen.queryByLabelText('Hourly rate')).not.toBeInTheDocument()
    })
  })

  it('saves successfully and fires CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED', async () => {
    let requestBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Individual',
        is_active: true,
        version: 'v2',
        wage_type: 'Hourly',
        hourly_rate: '50.00',
        file_new_hire_report: false,
      })
    })
    server.use(handleUpdateContractor(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByLabelText('Hourly')
    const rateField = screen.getByLabelText('Hourly rate')
    await user.clear(rateField)
    await user.type(rateField, '50')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(requestBody).toMatchObject({ type: 'Individual', wage_type: 'Hourly' })
    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
        expect.objectContaining({ hourlyRate: '50.00' }),
      )
    })
  })

  it('blocks an hourly rate above the server cap (regression for SDK-1297)', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Individual',
        is_active: true,
        version: 'v2',
        wage_type: 'Hourly',
        hourly_rate: '50.00',
        file_new_hire_report: false,
      }),
    )
    server.use(handleUpdateContractor(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    const rateField = await screen.findByLabelText('Hourly rate')
    await user.clear(rateField)
    await user.type(rateField, '1000000000001')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText("Hourly rate can't exceed $1,000,000,000,000.00")).toBeInTheDocument()
    })
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('fires CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_CANCELLED when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByLabelText('Hourly')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_CANCELLED,
    )
  })

  describe('SDK-1157 regression net', () => {
    const fixedContractor = {
      uuid: 'contractor-123',
      type: 'Individual',
      is_active: true,
      version: 'v1',
      wage_type: 'Fixed',
      file_new_hire_report: false,
    }

    it('renders the heading, wage type radios with descriptions in Fixed, Hourly order, and actions', async () => {
      renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

      expect(await screen.findByRole('heading', { name: 'Edit compensation' })).toBeInTheDocument()
      expect(
        screen.getByText("Update the contractor's compensation type and rate."),
      ).toBeInTheDocument()
      expect(screen.getByText('Compensation type')).toBeInTheDocument()

      const fixedRadio = screen.getByRole('radio', { name: 'Fixed' })
      const hourlyRadio = screen.getByRole('radio', { name: 'Hourly' })
      expect(screen.getAllByRole('radio')).toEqual([fixedRadio, hourlyRadio])
      expect(fixedRadio).toHaveAccessibleDescription('Pay a fixed amount each pay period.')
      expect(hourlyRadio).toHaveAccessibleDescription('Pay based on hours worked.')
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('renders a custom LoaderComponent while the contractor is loading', async () => {
      let releaseContractor: () => void = () => {}
      const contractorGate = new Promise<void>(resolve => {
        releaseContractor = resolve
      })
      server.use(
        handleGetContractor(async () => {
          await contractorGate
          return HttpResponse.json(fixedContractor)
        }),
      )

      renderWithProviders(
        <CompensationEditForm
          contractorId="contractor-123"
          onEvent={onEvent}
          LoaderComponent={() => <div>Loading compensation</div>}
        />,
      )

      expect(await screen.findByText('Loading compensation')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()

      releaseContractor()

      expect(await screen.findByRole('radio', { name: 'Fixed' })).toBeChecked()
    })

    it('shows an error banner when the contractor fetch fails', async () => {
      server.use(
        handleGetContractor(() =>
          HttpResponse.json(
            { errors: [{ category: 'server_error', message: 'Boom' }] },
            { status: 500 },
          ),
        ),
      )

      renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

      expect(
        await screen.findByText('There was a problem with your submission'),
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
    })

    it.each([
      ['left at the default 0', null],
      ['cleared', ''],
      ['set to 0', '0'],
    ])(
      'shows the required message after switching Fixed -> Hourly with the rate %s',
      async (_label, typedRate) => {
        server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))
        const updateResolver = vi.fn<HttpResponseResolver>(() =>
          HttpResponse.json({ ...fixedContractor, version: 'v2' }),
        )
        server.use(handleUpdateContractor(updateResolver))

        const user = userEvent.setup()
        renderWithProviders(
          <CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />,
        )

        expect(await screen.findByRole('radio', { name: 'Fixed' })).toBeChecked()
        expect(screen.queryByLabelText('Hourly rate')).toBeNull()

        await user.click(screen.getByRole('radio', { name: 'Hourly' }))
        const rateField = await screen.findByLabelText('Hourly rate')
        if (typedRate !== null) {
          await user.clear(rateField)
          if (typedRate) await user.type(rateField, typedRate)
        }
        await user.click(screen.getByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Enter a valid hourly rate')).toBeInTheDocument()
        expect(updateResolver).not.toHaveBeenCalled()
        expect(onEvent).not.toHaveBeenCalledWith(
          componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
          expect.anything(),
        )
      },
    )

    it('submits a Fixed -> Hourly switch with the typed rate as a string', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))
      let requestBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          ...fixedContractor,
          version: 'v2',
          wage_type: 'Hourly',
          hourly_rate: '25.50',
        })
      })
      server.use(handleUpdateContractor(updateResolver))

      const user = userEvent.setup()
      renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

      await user.click(await screen.findByRole('radio', { name: 'Hourly' }))
      const rateField = await screen.findByLabelText('Hourly rate')
      await user.clear(rateField)
      await user.type(rateField, '25.50')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(requestBody).toMatchObject({
        version: 'v1',
        type: 'Individual',
        wage_type: 'Hourly',
        hourly_rate: '25.5',
      })
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
        expect.objectContaining({ uuid: 'contractor-123', wageType: 'Hourly' }),
      )
    })

    it('submits an Hourly -> Fixed switch without hourly_rate', async () => {
      let requestBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...fixedContractor, version: 'v2' })
      })
      server.use(handleUpdateContractor(updateResolver))

      const user = userEvent.setup()
      renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

      await screen.findByLabelText('Hourly rate')
      await user.click(screen.getByRole('radio', { name: 'Fixed' }))
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(requestBody).toMatchObject({ version: 'v1', type: 'Individual', wage_type: 'Fixed' })
      expect(requestBody).not.toHaveProperty('hourly_rate')
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
        expect.objectContaining({ wageType: 'Fixed' }),
      )
    })

    it('shows an API error banner and the inline field error on a 422', async () => {
      const updateResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json(
          {
            errors: [
              {
                error_key: 'hourly_rate',
                category: 'invalid_attribute_value',
                message: 'Hourly rate is invalid',
              },
            ],
          },
          { status: 422 },
        ),
      )
      server.use(handleUpdateContractor(updateResolver))

      const user = userEvent.setup()
      renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

      await screen.findByLabelText('Hourly rate')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(
        await screen.findByText('There was a problem with your submission'),
      ).toBeInTheDocument()
      expect(screen.getAllByText('Hourly rate is invalid').length).toBeGreaterThanOrEqual(2)
      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(onEvent).not.toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
        expect.anything(),
      )
    })
  })
})
