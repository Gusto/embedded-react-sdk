import { useTranslation } from 'react-i18next'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export type PayrollOption = 'dismissalPayroll' | 'regularPayroll' | 'anotherWay'

interface TerminateEmployeePresentationProps {
  employeeName: string
  lastDayOfWork: Date | null
  onLastDayOfWorkChange: (date: Date | null) => void
  payrollOption: PayrollOption
  onPayrollOptionChange: (option: PayrollOption) => void
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
  lastDayError?: string
}

export function TerminateEmployeePresentation({
  employeeName,
  lastDayOfWork,
  onLastDayOfWorkChange,
  payrollOption,
  onPayrollOptionChange,
  onSubmit,
  onCancel,
  isLoading,
  lastDayError,
}: TerminateEmployeePresentationProps) {
  const { Alert, Heading, Text, DatePicker, RadioGroup, Button } = useComponentContext()
  useI18n('Terminations.TerminateEmployee')
  const { t } = useTranslation('Terminations.TerminateEmployee')

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
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('title', { employeeName })}</Heading>
        <Text variant="supporting">{t('subtitle')}</Text>
      </Flex>

      <Flex flexDirection="column" gap={24}>
        <DatePicker
          label={t('form.lastDayOfEmployment.label')}
          description={t('form.lastDayOfEmployment.description')}
          value={lastDayOfWork}
          onChange={onLastDayOfWorkChange}
          isRequired
          errorMessage={lastDayError}
          isInvalid={!!lastDayError}
        />

        <RadioGroup
          label={t('form.payrollOption.label')}
          description={t('form.payrollOption.description')}
          value={payrollOption}
          onChange={value => {
            onPayrollOptionChange(value as PayrollOption)
          }}
          options={payrollOptions}
        />
        <Alert status="warning" label={t(`alert.${payrollOption}.label`)}>
          <Text>{t(`alert.${payrollOption}.text`, { employeeName })}</Text>
        </Alert>
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
