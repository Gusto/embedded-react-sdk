import { useTranslation } from 'react-i18next'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export type PayrollOption = 'dismissalPayroll' | 'regularPayroll' | 'anotherWay'

interface EmployeeTerminationsPresentationProps {
  employeeName: string
  lastDayOfWork: Date | null
  onLastDayOfWorkChange: (date: Date | null) => void
  payrollOption: PayrollOption | null
  onPayrollOptionChange: (option: PayrollOption) => void
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
  lastDayError?: string
  payrollOptionError?: string
}

export function EmployeeTerminationsPresentation({
  employeeName,
  lastDayOfWork,
  onLastDayOfWorkChange,
  payrollOption,
  onPayrollOptionChange,
  onSubmit,
  onCancel,
  isLoading,
  lastDayError,
  payrollOptionError,
}: EmployeeTerminationsPresentationProps) {
  const { Heading, Text, DatePicker, RadioGroup, Button } = useComponentContext()
  useI18n('Terminations.EmployeeTerminations')
  const { t } = useTranslation('Terminations.EmployeeTerminations')

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
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8}>
        <Heading as="h2">{t('title', { employeeName })}</Heading>
        <Text>{t('subtitle')}</Text>
      </Flex>

      <Flex flexDirection="column" gap={24}>
        <DatePicker
          label={t('form.lastDayOfWork.label')}
          description={t('form.lastDayOfWork.description')}
          value={lastDayOfWork}
          onChange={onLastDayOfWorkChange}
          isRequired
          errorMessage={lastDayError}
          isInvalid={!!lastDayError}
        />

        <RadioGroup
          label={t('form.payrollOption.label')}
          value={payrollOption ?? undefined}
          onChange={value => {
            onPayrollOptionChange(value as PayrollOption)
          }}
          isRequired
          errorMessage={payrollOptionError}
          isInvalid={!!payrollOptionError}
          options={payrollOptions}
        />
      </Flex>

      <ActionsLayout>
        <Button variant="secondary" onClick={onCancel} isDisabled={isLoading}>
          {t('actions.cancel')}
        </Button>
        <Button variant="primary" onClick={onSubmit} isLoading={isLoading}>
          {t('actions.submit')}
        </Button>
      </ActionsLayout>
    </Flex>
  )
}
