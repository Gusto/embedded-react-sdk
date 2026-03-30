import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PolicyList } from './PolicyList'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

const mockPolicies = [
  {
    uuid: 'policy-1',
    company_uuid: 'company-123',
    name: 'Paid Time Off',
    policy_type: 'vacation',
    accrual_method: 'per_pay_period',
    accrual_rate: '40.0',
    paid_out_on_termination: true,
    complete: true,
    is_active: true,
    employees: [{ uuid: 'emp-1' }, { uuid: 'emp-2' }],
  },
  {
    uuid: 'policy-2',
    company_uuid: 'company-123',
    name: 'Sick Leave',
    policy_type: 'sick',
    accrual_method: 'per_pay_period',
    accrual_rate: '20.0',
    paid_out_on_termination: false,
    complete: true,
    is_active: true,
    employees: [{ uuid: 'emp-1' }],
  },
  {
    uuid: 'policy-3',
    company_uuid: 'company-123',
    name: 'Company PTO',
    policy_type: 'vacation',
    accrual_method: 'per_pay_period',
    complete: false,
    is_active: true,
    employees: [],
  },
]

describe('PolicyList', () => {
  const defaultProps = {
    companyId: 'company-123',
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_uuid/time_off_policies`, () => {
        return HttpResponse.json(mockPolicies)
      }),
    )
  })

  it('renders policies from the API', async () => {
    renderWithProviders(<PolicyList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Paid Time Off')).toBeInTheDocument()
    })

    expect(screen.getByText('Sick Leave')).toBeInTheDocument()
    expect(screen.getByText('Company PTO')).toBeInTheDocument()
  })

  it('renders empty state when no policies exist', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_uuid/time_off_policies`, () => {
        return HttpResponse.json([])
      }),
    )

    renderWithProviders(<PolicyList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('emptydata')).toBeInTheDocument()
    })
  })

  it('fires TIME_OFF_CREATE_POLICY event on "Create policy" click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PolicyList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Paid Time Off')).toBeInTheDocument()
    })

    const createButton = screen.getByRole('button', { name: 'Create policy' })
    await user.click(createButton)

    expect(defaultProps.onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_CREATE_POLICY)
  })

  it('shows "Finish setup" button for incomplete policies', async () => {
    renderWithProviders(<PolicyList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Company PTO')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Finish setup' })).toBeInTheDocument()
  })

  it('fires TIME_OFF_VIEW_POLICY with policyId and policyType on "Finish setup" click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PolicyList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Company PTO')).toBeInTheDocument()
    })

    const finishButton = screen.getByRole('button', { name: 'Finish setup' })
    await user.click(finishButton)

    expect(defaultProps.onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_VIEW_POLICY, {
      policyId: 'policy-3',
      policyType: 'vacation',
    })
  })

  it('opens delete confirmation dialog from the overflow menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PolicyList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Paid Time Off')).toBeInTheDocument()
    })

    const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(menuButtons[0]!)

    const deleteMenuItem = await screen.findByRole('menuitem', { name: 'Delete policy' })
    await user.click(deleteMenuItem)

    expect(
      screen.getByText(/Are you sure you want to delete the policy "Paid Time Off"\?/),
    ).toBeInTheDocument()
  })
})
