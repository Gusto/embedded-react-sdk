import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeOffPolicyDetailPresentation } from './TimeOffPolicyDetailPresentation'
import type { TimeOffPolicyDetailEmployee, PolicySettingsDisplay } from './TimeOffPolicyDetailTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const limitedPolicyDetails = {
  policyType: 'vacation' as const,
  accrualMethod: 'perHourWorked' as const,
  accrualRate: 2.0,
  accrualRateUnit: 20.0,
  resetDate: 'January 1',
}

const unlimitedPolicyDetails = {
  policyType: 'vacation' as const,
  accrualMethod: 'unlimited' as const,
}

const policySettings: PolicySettingsDisplay = {
  maxAccrualHoursPerYear: null,
  maxHours: 240,
  carryoverLimitHours: null,
  accrualWaitingPeriodDays: null,
  paidOutOnTermination: true,
}

const fullPolicySettings: PolicySettingsDisplay = {
  maxAccrualHoursPerYear: 100,
  maxHours: 240,
  carryoverLimitHours: 50,
  accrualWaitingPeriodDays: 30,
  paidOutOnTermination: false,
}

const mockEmployees: TimeOffPolicyDetailEmployee[] = [
  {
    uuid: '1',
    firstName: 'Alejandro',
    lastName: 'Kuhic',
    jobTitle: 'Marketing Director',
    balance: 80,
  },
  { uuid: '2', firstName: 'Alexander', lastName: 'Hamilton', jobTitle: 'Engineer', balance: 120.5 },
  { uuid: '3', firstName: 'Arthur', lastName: 'Schopenhauer', jobTitle: 'Engineer', balance: null },
]

const closedRemoveDialog = {
  isOpen: false,
  employeeName: '',
  onConfirm: vi.fn(),
  onClose: vi.fn(),
  isPending: false,
}

describe('TimeOffPolicyDetailPresentation', () => {
  const onBack = vi.fn()
  const onTabChange = vi.fn()
  const onChangeSettings = vi.fn()
  const onDismissAlert = vi.fn()
  const onSearchChange = vi.fn()
  const onSearchClear = vi.fn()
  const onSelect = vi.fn()
  const getIsItemSelected = vi.fn().mockReturnValue(false)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderComponent(overrides: Record<string, unknown> = {}) {
    const defaultProps = {
      title: 'Company PTO',
      subtitle: 'Paid time off policy',
      onBack,
      backLabel: 'Back',
      policyDetails: limitedPolicyDetails,
      policySettings,
      onChangeSettings,
      selectedTabId: 'details',
      onTabChange,
      employees: {
        data: mockEmployees,
        searchValue: '',
        onSearchChange,
        onSearchClear,
        selectionMode: 'multiple' as const,
        onSelect,
        getIsItemSelected,
      },
      removeDialog: closedRemoveDialog,
      ...overrides,
    }

    return renderWithProviders(<TimeOffPolicyDetailPresentation {...defaultProps} />)
  }

  describe('header and navigation', () => {
    it('renders the policy title and subtitle', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Company PTO' })).toBeInTheDocument()
      })
      expect(screen.getByText('Paid time off policy')).toBeInTheDocument()
    })

    it('renders back button and calls onBack when clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('renders action buttons when provided', async () => {
      renderComponent({
        actions: [
          <button key="add">Add employees</button>,
          <button key="edit">Edit policy</button>,
        ],
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Add employees' })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Edit policy' })).toBeInTheDocument()
    })
  })

  describe('details tab - limited policy', () => {
    it('renders the Details card with policy type, rate, and reset date', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument()
      })
      expect(screen.getByText('Accrual type')).toBeInTheDocument()
      expect(screen.getByText('Based on hours worked')).toBeInTheDocument()
      expect(screen.getByText('Accrual rate')).toBeInTheDocument()
      expect(screen.getByText('Reset date')).toBeInTheDocument()
      expect(screen.getByText('January 1')).toBeInTheDocument()
    })

    it('renders the Settings card with all fields', async () => {
      renderComponent({ policySettings: fullPolicySettings })

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.getByText('Accrual maximum')).toBeInTheDocument()
      expect(screen.getByText('100 hour(s) per year')).toBeInTheDocument()
      expect(screen.getByText('Balance maximum')).toBeInTheDocument()
      expect(screen.getByText('240 hour(s)')).toBeInTheDocument()
      expect(screen.getByText('Carry over limit')).toBeInTheDocument()
      expect(screen.getByText('50 hour(s)')).toBeInTheDocument()
      expect(screen.getByText('Waiting period')).toBeInTheDocument()
      expect(screen.getByText('30 day(s)')).toBeInTheDocument()
      expect(screen.getByText('Paid out on termination')).toBeInTheDocument()
    })

    it('renders "No maximum" / "No limit" / "No waiting period" when null', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.getByText('No maximum')).toBeInTheDocument()
      expect(screen.getByText('No carry over limit')).toBeInTheDocument()
      expect(screen.getByText('No waiting period')).toBeInTheDocument()
    })

    it('renders the Change button and calls onChangeSettings', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Change' }))
      expect(onChangeSettings).toHaveBeenCalledTimes(1)
    })
  })

  describe('details tab - unlimited policy', () => {
    it('hides the Settings card for unlimited policies', async () => {
      renderComponent({
        policyDetails: unlimitedPolicyDetails,
        policySettings: undefined,
      })

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument()
      })
      expect(screen.getByText('Unlimited')).toBeInTheDocument()
      expect(screen.queryByText('Policy settings')).not.toBeInTheDocument()
    })
  })

  describe('tab switching', () => {
    it('calls onTabChange when switching tabs via select dropdown', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Company PTO' })).toBeInTheDocument()
      })

      const tabSelect = screen.getByRole('button', { name: /Company PTO/i })
      await user.click(tabSelect)

      const employeesOption = await screen.findByRole('option', { name: 'Employees' })
      await user.click(employeesOption)
      expect(onTabChange).toHaveBeenCalled()
    })
  })

  describe('employees tab', () => {
    it('renders employee table with Balance column header', async () => {
      renderComponent({ selectedTabId: 'employees' })

      await waitFor(() => {
        expect(screen.getAllByText('Balance (hrs)').length).toBeGreaterThan(0)
      })
    })

    it('renders employee names and balances', async () => {
      renderComponent({ selectedTabId: 'employees' })

      await waitFor(() => {
        expect(screen.getByText('Alejandro Kuhic')).toBeInTheDocument()
      })
      expect(screen.getByText('80')).toBeInTheDocument()
      expect(screen.getByText('120.5')).toBeInTheDocument()
    })

    it('renders dash for null balances', async () => {
      renderComponent({ selectedTabId: 'employees' })

      await waitFor(() => {
        expect(screen.getByText('Arthur Schopenhauer')).toBeInTheDocument()
      })
      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  describe('success alert', () => {
    it('renders success alert and allows dismissal', async () => {
      const user = userEvent.setup()
      renderComponent({
        successAlert: 'Employee removed successfully.',
        onDismissAlert,
      })

      await waitFor(() => {
        expect(screen.getByText('Employee removed successfully.')).toBeInTheDocument()
      })

      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await user.click(dismissButton)
      expect(onDismissAlert).toHaveBeenCalledTimes(1)
    })

    it('does not render alert when successAlert is undefined', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Company PTO' })).toBeInTheDocument()
      })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('remove dialog', () => {
    it('renders the remove dialog when open', async () => {
      renderComponent({
        removeDialog: {
          isOpen: true,
          employeeName: 'Alejandro Kuhic',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
          isPending: false,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Remove Alejandro Kuhic')).toBeInTheDocument()
      })
    })

    it('calls onConfirm when confirming removal', async () => {
      const onConfirm = vi.fn()
      const user = userEvent.setup()

      renderComponent({
        removeDialog: {
          isOpen: true,
          employeeName: 'Alejandro Kuhic',
          onConfirm,
          onClose: vi.fn(),
          isPending: false,
        },
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Remove' }))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('bulk remove dialog', () => {
    it('renders the bulk remove dialog when open', async () => {
      renderComponent({
        bulkRemoveDialog: {
          isOpen: true,
          count: 3,
          onConfirm: vi.fn(),
          onClose: vi.fn(),
          isPending: false,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Remove 3 employee(s) from policy?')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should not have accessibility violations on details tab', async () => {
      const { container } = renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Company PTO' })).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })

    it('should not have accessibility violations on employees tab', async () => {
      const { container } = renderComponent({ selectedTabId: 'employees' })

      await waitFor(() => {
        expect(screen.getAllByText('Balance (hrs)').length).toBeGreaterThan(0)
      })

      await expectNoAxeViolations(container, {
        rules: { 'heading-order': { enabled: false } },
      })
    })

    it('should not have accessibility violations with remove dialog open', async () => {
      const { container } = renderComponent({
        removeDialog: {
          isOpen: true,
          employeeName: 'Alejandro Kuhic',
          onConfirm: vi.fn(),
          onClose: vi.fn(),
          isPending: false,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Remove Alejandro Kuhic')).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })
  })
})
