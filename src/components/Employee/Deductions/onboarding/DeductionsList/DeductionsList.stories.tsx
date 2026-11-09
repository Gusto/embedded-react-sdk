import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within } from 'storybook/test'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { DeductionsList } from './DeductionsList'
import { BaseComponent } from '@/components/Base'

const meta = {
  title: 'Domain/Employee/Deductions/DeductionsList',
  component: DeductionsList,
  decorators: [
    Story => (
      <BaseComponent onEvent={fn()}>
        <Story />
      </BaseComponent>
    ),
  ],
  args: {
    onAdd: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onContinue: fn(),
  },
} satisfies Meta<typeof DeductionsList>

export default meta

type Story = StoryObj<typeof meta>

const childSupport: Garnishment = {
  uuid: 'child-support-1',
  active: true,
  description: 'Child Support',
  amount: '50',
  payPeriodMaximum: '150',
  recurring: true,
  deductAsPercentage: true,
  garnishmentType: 'child_support',
  childSupport: { paymentPeriod: 'Monthly' },
  times: null,
  annualMaximum: null,
  totalAmount: null,
}

export const ChildSupport: Story = {
  args: {
    deductionsList: {
      isLoading: false,
      data: {
        deductions: [
          childSupport,
          {
            ...childSupport,
            uuid: 'percentage-child-support',
            description: 'Percentage-only Child Support',
            payPeriodMaximum: null,
          },
          {
            ...childSupport,
            uuid: 'custom-1',
            description: 'Custom percentage deduction',
            amount: '5',
            payPeriodMaximum: null,
            garnishmentType: null,
            childSupport: null,
          },
        ],
      },
      status: { isFetching: false, isPending: false },
      actions: { onDelete: fn() },
      errorHandling: { errors: [], retryQueries: fn(), clearSubmitError: fn() },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText('$150.00')).resolves.toBeVisible()
    await expect(canvas.findAllByText('Monthly')).resolves.toHaveLength(2)
    await expect(canvas.findByText('50%')).resolves.toBeVisible()
    await expect(canvas.findByText('5% per paycheck')).resolves.toBeVisible()
  },
}
