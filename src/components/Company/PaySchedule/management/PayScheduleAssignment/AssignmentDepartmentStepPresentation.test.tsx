import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  AssignmentDepartmentStepPresentation,
  type AssignmentDepartmentStepPresentationProps,
} from './AssignmentDepartmentStepPresentation'
import { useI18n } from '@/i18n'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

function DepartmentForm(props: AssignmentDepartmentStepPresentationProps) {
  useI18n('Company.Management.PayScheduleAssignment')
  return <AssignmentDepartmentStepPresentation {...props} />
}

const engineering = { uuid: 'engineering', title: 'Engineering' }
const sales = { uuid: 'sales', title: 'Sales' }
const marketing = { uuid: 'marketing', title: 'Marketing' }

const props: AssignmentDepartmentStepPresentationProps = {
  departments: [engineering, sales],
  schedules: [
    { uuid: 'weekly', version: 'v1', customName: 'Weekly' },
    { uuid: 'monthly', version: 'v2', customName: 'Monthly' },
  ],
  selection: {
    defaultPayScheduleUuid: 'weekly',
    departments: [
      { departmentUuid: 'engineering', payScheduleUuid: 'weekly' },
      { departmentUuid: 'sales', payScheduleUuid: 'weekly' },
    ],
  },
  onBack: vi.fn(),
  onAddPaySchedule: vi.fn(),
  onContinue: vi.fn(),
}

describe('department selections after a department refresh', () => {
  it('keeps selections with their department after adding and reordering departments', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    const { rerender } = renderWithProviders(<DepartmentForm {...props} onContinue={onContinue} />)
    await user.click(await screen.findByRole('button', { name: /engineering/i }))
    await user.click(screen.getByRole('option', { name: /monthly/i }))

    rerender(
      <DepartmentForm
        {...props}
        departments={[sales, marketing, engineering]}
        onContinue={onContinue}
      />,
    )
    expect(screen.getByRole('button', { name: /engineering/i })).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /sales/i })).toHaveTextContent('Weekly')
    await user.click(screen.getByRole('button', { name: /marketing/i }))
    await user.click(screen.getByRole('option', { name: /weekly/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onContinue).toHaveBeenCalledWith({
      defaultPayScheduleUuid: 'weekly',
      departments: [
        { departmentUuid: 'sales', payScheduleUuid: 'weekly' },
        { departmentUuid: 'marketing', payScheduleUuid: 'weekly' },
        { departmentUuid: 'engineering', payScheduleUuid: 'monthly' },
      ],
    })
  })

  it('omits removed departments from the submitted selection', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    const { rerender } = renderWithProviders(<DepartmentForm {...props} onContinue={onContinue} />)
    await screen.findByRole('button', { name: /sales/i })
    rerender(<DepartmentForm {...props} departments={[engineering]} onContinue={onContinue} />)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onContinue).toHaveBeenCalledWith({
      defaultPayScheduleUuid: 'weekly',
      departments: [{ departmentUuid: 'engineering', payScheduleUuid: 'weekly' }],
    })
  })
})
