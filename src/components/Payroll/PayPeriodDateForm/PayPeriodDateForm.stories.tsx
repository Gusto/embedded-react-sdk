import type { Meta, StoryObj } from '@storybook/react-vite'
import { PayPeriodDateForm } from './PayPeriodDateForm'

const meta: Meta<typeof PayPeriodDateForm> = {
  title: 'Payroll/PayPeriodDateForm',
  component: PayPeriodDateForm,
  parameters: {
    layout: 'padded',
  },
  args: {
    companyId: 'company-123',
  },
}

export default meta
type Story = StoryObj<typeof PayPeriodDateForm>

export const Default: Story = {
  args: {
    payrollType: 'bonus',
  },
}

export const CorrectionPayroll: Story = {
  args: {
    payrollType: 'correction',
  },
}

export const CheckOnlyMode: Story = {
  args: {
    payrollType: 'bonus',
    initialValues: {
      isCheckOnly: true,
    },
  },
}

export const WithInitialValues: Story = {
  args: {
    payrollType: 'bonus',
    initialValues: {
      isCheckOnly: false,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-01-31'),
      checkDate: new Date('2026-02-10'),
    },
  },
}
