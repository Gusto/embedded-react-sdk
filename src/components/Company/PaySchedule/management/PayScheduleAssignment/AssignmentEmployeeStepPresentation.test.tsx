import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  AssignmentEmployeeStepPresentation,
  type AssignmentEmployeeStepPresentationProps,
} from './AssignmentEmployeeStepPresentation'
import { useI18n } from '@/i18n'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

function EmployeeForm(props: AssignmentEmployeeStepPresentationProps) {
  useI18n('Company.Management.PayScheduleAssignment')
  return <AssignmentEmployeeStepPresentation {...props} />
}
const first = {
  uuid: 'first',
  paymentMethod: 'Check' as const,
  firstName: 'Alex',
  lastName: 'Smith',
}
const second = {
  uuid: 'second',
  paymentMethod: 'Check' as const,
  firstName: 'Sam',
  lastName: 'Jones',
}
const third = {
  uuid: 'third',
  paymentMethod: 'Check' as const,
  firstName: 'Casey',
  lastName: 'Lee',
}
const props: AssignmentEmployeeStepPresentationProps = {
  employees: [first, second],
  schedules: [
    { uuid: 'weekly', version: 'v1', customName: 'Weekly' },
    { uuid: 'monthly', version: 'v2', customName: 'Monthly' },
  ],
  selection: {
    employees: [first, second, third].map(employee => ({
      employeeUuid: employee.uuid,
      payScheduleUuid: 'weekly',
    })),
  },
  onBack: vi.fn(),
  onAddPaySchedule: vi.fn(),
  onContinue: vi.fn(),
}
describe('employee assignment roster changes', () => {
  it('keeps edits keyed by UUID when employees are added, reordered, and removed', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    const { rerender } = renderWithProviders(<EmployeeForm {...props} onContinue={onContinue} />)
    await user.click(await screen.findByRole('button', { name: /pay schedule for alex/i }))
    await user.click(screen.getByRole('option', { name: /monthly/i }))
    rerender(<EmployeeForm {...props} employees={[second, third, first]} onContinue={onContinue} />)
    expect(screen.getByRole('button', { name: /pay schedule for alex/i })).toHaveTextContent(
      'Monthly',
    )
    expect(screen.getByRole('button', { name: /pay schedule for casey/i })).toHaveTextContent(
      'Weekly',
    )
    rerender(<EmployeeForm {...props} employees={[third, first]} onContinue={onContinue} />)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onContinue).toHaveBeenCalledWith({
      employees: [
        { employeeUuid: 'third', payScheduleUuid: 'weekly' },
        { employeeUuid: 'first', payScheduleUuid: 'monthly' },
      ],
    })
  })
  it('requires a valid schedule for every employee, including employees on other pages', async () => {
    const roster = Array.from({ length: 6 }, (_, index) => ({
      ...first,
      uuid: `employee-${index}`,
      firstName: `Employee ${index}`,
    }))
    renderWithProviders(
      <EmployeeForm
        {...props}
        employees={roster}
        selection={{
          employees: roster.map((employee, index) => ({
            employeeUuid: employee.uuid,
            payScheduleUuid: index === 5 ? '' : 'weekly',
          })),
        }}
      />,
    )
    expect(await screen.findByRole('button', { name: /continue/i })).toBeDisabled()
    const user = userEvent.setup()
    await user.click(screen.getByTestId('pagination-next'))
    await user.click(screen.getByRole('button', { name: /pay schedule for employee 5/i }))
    await user.click(screen.getByRole('option', { name: /weekly/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })
  it('disables Continue if the selected schedule is removed', async () => {
    const { rerender } = renderWithProviders(<EmployeeForm {...props} />)
    expect(await screen.findByRole('button', { name: /continue/i })).toBeEnabled()
    rerender(<EmployeeForm {...props} schedules={[]} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /add pay schedule/i })).toBeEnabled()
  })
})
