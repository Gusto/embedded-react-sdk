import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PayPeriodDateForm } from './PayPeriodDateForm'
import {
  createPayPeriodDateFormSchema,
  type PayPeriodDateFormData,
  type PayPeriodDateFormProps,
} from './PayPeriodDateFormTypes'
import { usePayPeriodDateValidation } from './usePayPeriodDateValidation'

function FormWrapper({
  children,
  initialValues,
  payrollType = 'bonus',
}: {
  children: React.ReactNode
  initialValues?: PayPeriodDateFormProps['initialValues']
  payrollType?: 'bonus' | 'correction'
}) {
  const { minCheckDate, today } = usePayPeriodDateValidation()
  const isCheckOnly = initialValues?.isCheckOnly ?? false

  const schema = createPayPeriodDateFormSchema(
    (key: string) => {
      const messages: Record<string, string> = {
        'validations.startDateRequired': 'Start date is required',
        'validations.endDateRequired': 'End date is required',
        'validations.checkDateRequired': 'Payment date is required',
        'validations.endDateAfterStart': 'End date must be after start date',
        'validations.checkDateAchLeadTime':
          'Payment date must be at least 2 business days from today',
        'validations.startDateNotFuture': 'Start date cannot be in the future for corrections',
      }
      return messages[key] || key
    },
    payrollType,
    isCheckOnly ? today : minCheckDate,
  )

  const methods = useForm<PayPeriodDateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isCheckOnly: initialValues?.isCheckOnly ?? false,
      startDate: initialValues?.startDate ?? null,
      endDate: initialValues?.endDate ?? null,
      checkDate: initialValues?.checkDate ?? null,
    },
    mode: 'onBlur',
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

const meta: Meta<typeof PayPeriodDateForm> = {
  title: 'Payroll/PayPeriodDateForm',
  component: PayPeriodDateForm,
  parameters: {
    layout: 'padded',
  },
  args: {
    companyId: 'company-123',
  },
  decorators: [
    (Story, context) => (
      <FormWrapper
        initialValues={context.args.initialValues}
        payrollType={context.args.payrollType}
      >
        <Story />
      </FormWrapper>
    ),
  ],
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
