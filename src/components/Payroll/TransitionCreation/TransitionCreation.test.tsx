import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransitionCreation } from './TransitionCreation'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const START_DATE = '2025-08-14'
const END_DATE = '2025-08-27'
const PAY_SCHEDULE_UUID = '1478a82e-b45c-4980-843a-6ddc3b78268e'

describe('TransitionCreation', () => {
  const defaultProps = {
    companyId: COMPANY_ID,
    startDate: START_DATE,
    endDate: END_DATE,
    payScheduleUuid: PAY_SCHEDULE_UUID,
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('rendering', () => {
    it('renders the page title', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /transition payroll/i, level: 2 }),
        ).toBeInTheDocument()
      })
    })

    it('renders the transition explanation alert', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('renders the transition details section', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/transition details/i)).toBeInTheDocument()
      })
    })

    it('renders the check date input', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/check date/i)).toBeInTheDocument()
      })
    })

    it('renders the continue button', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })
    })
  })

  describe('validation', () => {
    it('shows check date required error when submitting without a date', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/check date is required/i)).toBeInTheDocument()
      })
    })
  })
})
