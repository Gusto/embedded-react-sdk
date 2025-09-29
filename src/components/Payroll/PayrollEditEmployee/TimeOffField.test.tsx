import { expect, describe, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { Suspense } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsTypePaidTimeOff } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { TimeOffField } from './TimeOffField'
import type { PayrollEditEmployeeFormValues } from './PayrollEditEmployeePresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const TestWrapper = ({
  timeOffEntry,
  employee,
}: {
  timeOffEntry: PayrollEmployeeCompensationsTypePaidTimeOff
  employee: Employee
}) => {
  const methods = useForm<PayrollEditEmployeeFormValues>({
    defaultValues: {
      timeOffCompensations: {
        [timeOffEntry.name || '']: timeOffEntry.hours || '0',
      },
    },
  })

  return (
    <FormProvider {...methods}>
      <Suspense fallback={<div>Loading...</div>}>
        <TimeOffField timeOff={timeOffEntry} employee={employee} />
      </Suspense>
    </FormProvider>
  )
}

const mockEmployee: Employee = {
  uuid: 'test-uuid',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  companyUuid: 'company-uuid',
  eligiblePaidTimeOff: [
    {
      name: 'Vacation Hours',
      policyName: 'Vacation Policy',
      policyUuid: 'policy-uuid',
      accrualUnit: 'Hour',
      accrualRate: '208.0',
      accrualMethod: 'per_hour_worked',
      accrualPeriod: 'Year',
      accrualBalance: '40.0',
      maximumAccrualBalance: '240.0',
      paidAtTermination: true,
    },
    {
      name: 'Sick Hours',
      policyName: 'Sick Policy',
      policyUuid: 'sick-policy-uuid',
      accrualUnit: 'Hour',
      accrualRate: '104.0',
      accrualMethod: 'unlimited',
      accrualPeriod: 'Year',
      accrualBalance: '0.0',
      maximumAccrualBalance: '0.0',
      paidAtTermination: false,
    },
  ],
}

describe('TimeOffField', () => {
  it('should render time off input field', async () => {
    const timeOffEntry: PayrollEmployeeCompensationsTypePaidTimeOff = {
      name: 'Vacation Hours',
      hours: '8.0',
    }

    renderWithProviders(<TestWrapper timeOffEntry={timeOffEntry} employee={mockEmployee} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Vacation Hours')).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('8.0')).toBeInTheDocument()
  })

  it('should show remaining balance for accrual policies', async () => {
    const timeOffEntry: PayrollEmployeeCompensationsTypePaidTimeOff = {
      name: 'Vacation Hours',
      hours: '8.0',
    }

    renderWithProviders(<TestWrapper timeOffEntry={timeOffEntry} employee={mockEmployee} />)

    await waitFor(() => {
      expect(screen.getByText(/32\.0.*remaining/)).toBeInTheDocument()
    })
  })

  it('should not show balance for unlimited policies', async () => {
    const timeOffEntry: PayrollEmployeeCompensationsTypePaidTimeOff = {
      name: 'Sick Hours',
      hours: '0.0',
    }

    renderWithProviders(<TestWrapper timeOffEntry={timeOffEntry} employee={mockEmployee} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Sick Hours')).toBeInTheDocument()
    })
    expect(screen.queryByText('remaining')).not.toBeInTheDocument()
  })

  it('should not render if timeOffEntry has no name', () => {
    const timeOffEntry: PayrollEmployeeCompensationsTypePaidTimeOff = { hours: '8.0' }

    renderWithProviders(<TestWrapper timeOffEntry={timeOffEntry} employee={mockEmployee} />)

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('should not show balance if no matching policy found', async () => {
    const timeOffEntry: PayrollEmployeeCompensationsTypePaidTimeOff = {
      name: 'Unknown Policy',
      hours: '8.0',
    }

    renderWithProviders(<TestWrapper timeOffEntry={timeOffEntry} employee={mockEmployee} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Unknown Policy')).toBeInTheDocument()
    })
    expect(screen.queryByText('remaining')).not.toBeInTheDocument()
  })
})
