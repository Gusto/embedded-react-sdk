import { useTranslation } from 'react-i18next'
import z from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Termination } from '@gusto/embedded-api/models/components/termination'
import type { PayrollOption } from '../types'
import type { TerminateEmployeeFormData } from './TerminateEmployee'
import { Flex, ActionsLayout, DatePickerField, RadioGroupField } from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

interface TerminateEmployeePresentationProps {
  employeeName: string
  existingTermination?: Termination
  onSubmit: (data: TerminateEmployeeFormData) => void
  onCancel: () => void
  isLoading: boolean
}

const terminateEmployeeSchema = z.object({
  lastDayOfWork: z.date({ error: 'validation.lastDayRequired' }),
  payrollOption: z.enum(['dismissalPayroll', 'regularPayroll', 'anotherWay'], {
    error: 'validation.payrollOptionRequired',
  }),
})

export function TerminateEmployeePresentation({
  employeeName,
  existingTermination,
  onSubmit,
  onCancel,
  isLoading,
}: TerminateEmployeePresentationProps) {
  const { Alert, Heading, Text, Button } = useComponentContext()
  useI18n('Terminations.TerminateEmployee')
  const { t } = useTranslation('Terminations.TerminateEmployee')

  const getPayrollOptionFromTermination = (termination: Termination): PayrollOption => {
    if (termination.runTerminationPayroll === true) {
      return 'dismissalPayroll'
    }
    return 'regularPayroll'
  }

  const initialValues: Partial<TerminateEmployeeFormData> = {
    lastDayOfWork: existingTermination?.effectiveDate
      ? new Date(existingTermination.effectiveDate)
      : undefined,
    payrollOption: existingTermination
      ? getPayrollOptionFromTermination(existingTermination)
      : 'dismissalPayroll',
  }
  const formMethods = useForm<TerminateEmployeeFormData>({
    resolver: zodResolver(terminateEmployeeSchema),
    defaultValues: initialValues,
  })

  const selectedPayrollOption = formMethods.watch('payrollOption')

  const payrollOptions = [
    {
      value: 'dismissalPayroll' as const,
      label: t('form.payrollOption.options.dismissalPayroll.label'),
      description: t('form.payrollOption.options.dismissalPayroll.description'),
    },
    {
      value: 'regularPayroll' as const,
      label: t('form.payrollOption.options.regularPayroll.label'),
      description: t('form.payrollOption.options.regularPayroll.description'),
    },
    {
      value: 'anotherWay' as const,
      label: t('form.payrollOption.options.anotherWay.label'),
      description: t('form.payrollOption.options.anotherWay.description'),
    },
  ]

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={24}>
          <Flex flexDirection="column" gap={4}>
            <Heading as="h2">{t('title', { employeeName })}</Heading>
            <Text variant="supporting">{t('subtitle')}</Text>
          </Flex>

          <Flex flexDirection="column" gap={24}>
            <DatePickerField
              name="lastDayOfWork"
              label={t('form.lastDayOfEmployment.label')}
              description={t('form.lastDayOfEmployment.description')}
              isRequired
              errorMessage={t('validation.lastDayRequired')}
            />

            <RadioGroupField<PayrollOption>
              name="payrollOption"
              label={t('form.payrollOption.label')}
              description={t('form.payrollOption.description')}
              options={payrollOptions}
              isRequired
              errorMessage={t('validation.payrollOptionRequired')}
            />
            <Alert status="warning" label={t(`alert.${selectedPayrollOption}.label`)}>
              <Text>{t(`alert.${selectedPayrollOption}.text`, { employeeName })}</Text>
            </Alert>
          </Flex>

          <ActionsLayout>
            <Button variant="secondary" onClick={onCancel} isDisabled={isLoading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {t('actions.submit')}
            </Button>
          </ActionsLayout>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
