import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { OnboardingSummary } from './OnboardingSummary'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { handleGetEmployee } from '@/test/mocks/apis/employees'

const EMPLOYEE_ID = '4b3f930f-82cd-48a8-b797-798686e12e5e'

const employeeFixture = {
  uuid: EMPLOYEE_ID,
  first_name: 'Isom',
  last_name: 'Jaskolski',
  company_uuid: 'a007e1ab-3595-43c2-ab4b-af7a5af2e365',
  version: '1c7ba9d62c8bafbfff998ffccad5d296',
  terminated: false,
  two_percent_shareholder: false,
  onboarded: false,
  onboarding_status: 'admin_onboarding_incomplete',
  jobs: [],
  terminations: [],
  custom_fields: [],
  garnishments: [],
  eligible_paid_time_off: [],
}

const buildStep = (id: string, completed: boolean) => ({
  title: id,
  id,
  required: true,
  completed,
  requirements: [],
})

const allStepsComplete = [
  buildStep('personal_details', true),
  buildStep('compensation_details', true),
  buildStep('add_work_address', true),
  buildStep('add_home_address', true),
  buildStep('federal_tax_setup', true),
  buildStep('state_tax_setup', true),
  buildStep('direct_deposit_setup', true),
  buildStep('employee_form_signing', true),
]

const employeeStepsIncomplete = [
  buildStep('personal_details', true),
  buildStep('compensation_details', true),
  buildStep('add_work_address', true),
  buildStep('add_home_address', false),
  buildStep('federal_tax_setup', false),
  buildStep('state_tax_setup', false),
  buildStep('direct_deposit_setup', false),
  buildStep('employee_form_signing', false),
]

function setupOnboardingHandlers({
  status,
  steps = employeeStepsIncomplete,
}: {
  status: string
  steps?: ReturnType<typeof buildStep>[]
}) {
  server.use(
    handleGetEmployee(() => HttpResponse.json(employeeFixture)),
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`, () =>
      HttpResponse.json({
        uuid: EMPLOYEE_ID,
        onboarding_status: status,
        onboarding_steps: steps,
      }),
    ),
  )
}

describe('Employee OnboardingSummary', () => {
  const user = userEvent.setup()
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  describe('isAdmin=true', () => {
    it('shows the "ready to get paid" copy when onboarding is fully complete', async () => {
      setupOnboardingHandlers({
        status: 'onboarding_completed',
        steps: allStepsComplete,
      })

      renderWithProviders(
        <OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
          /Isom Jaskolski is ready to get paid/i,
        )
      })
      expect(screen.queryByText(/invite is on its way/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Missing requirements/i)).not.toBeInTheDocument()
    })

    it('shows the handoff copy for SELF_ONBOARDING_PENDING_INVITE', async () => {
      setupOnboardingHandlers({ status: 'self_onboarding_pending_invite' })

      renderWithProviders(
        <OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
          /Isom Jaskolski's invite is on its way/i,
        )
      })
      expect(
        screen.getByText(/They'll complete the remaining setup steps on their own/i),
      ).toBeInTheDocument()
      expect(screen.queryByText(/Missing requirements/i)).not.toBeInTheDocument()
    })

    it('shows the handoff copy for SELF_ONBOARDING_INVITED_STARTED', async () => {
      setupOnboardingHandlers({ status: 'self_onboarding_invited_started' })

      renderWithProviders(
        <OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/invite is on its way/i)
      })
      expect(screen.queryByText(/Missing requirements/i)).not.toBeInTheDocument()
    })

    it('shows the missing-requirements list for ADMIN_ONBOARDING_INCOMPLETE', async () => {
      setupOnboardingHandlers({
        status: 'admin_onboarding_incomplete',
        steps: [
          buildStep('personal_details', true),
          buildStep('compensation_details', false),
          buildStep('add_work_address', false),
        ],
      })

      renderWithProviders(
        <OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Missing requirements/i })).toBeInTheDocument()
      })
      expect(screen.getByText(/Job and compensation/i)).toBeInTheDocument()
      expect(screen.queryByText(/invite is on its way/i)).not.toBeInTheDocument()
    })

    it('shows the missing-requirements list for SELF_ONBOARDING_AWAITING_ADMIN_REVIEW (admin still owes review)', async () => {
      setupOnboardingHandlers({
        status: 'self_onboarding_awaiting_admin_review',
        steps: [...allStepsComplete, buildStep('admin_review', false)],
      })

      renderWithProviders(
        <OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Missing requirements/i })).toBeInTheDocument()
      })
      expect(screen.queryByText(/invite is on its way/i)).not.toBeInTheDocument()
    })

    it('fires EMPLOYEES_LIST when the Done button is clicked in the handoff branch', async () => {
      setupOnboardingHandlers({ status: 'self_onboarding_pending_invite' })

      renderWithProviders(
        <OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /Done/i }))

      expect(mockOnEvent).toHaveBeenCalledWith('company/employees')
    })
  })

  describe('isAdmin=false', () => {
    it('renders the self-onboarded confirmation copy regardless of status', async () => {
      setupOnboardingHandlers({ status: 'self_onboarding_completed_by_employee' })

      renderWithProviders(
        <OnboardingSummary employeeId={EMPLOYEE_ID} isAdmin={false} onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /You've completed setup/i })).toBeInTheDocument()
      })
      expect(screen.queryByText(/invite is on its way/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Missing requirements/i)).not.toBeInTheDocument()
    })
  })
})
