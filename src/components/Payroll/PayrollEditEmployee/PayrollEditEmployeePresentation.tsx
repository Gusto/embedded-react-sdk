import { FormProvider, useForm } from 'react-hook-form'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import { useTranslation } from 'react-i18next'
import { Flex, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'

interface PayrollEditEmployeeProps {
  onDone: () => void
  employee: Employee
  employeeCompensation: EmployeeCompensations
}

export const PayrollEditEmployeePresentation = ({
  onDone,
  employee,
  employeeCompensation,
}: PayrollEditEmployeeProps) => {
  const { Button, Heading, Text } = useComponentContext()

  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  const formHandlers = useForm()

  const employeeName = `${employee.firstName} ${employee.lastName}`
  const grossPay = employeeCompensation.grossPay || '0.00'

  return (
    <Flex flexDirection="column" gap={20}>
      <Heading as="h2">{t('pageTitle', { employeeName })}</Heading>
      <Heading as="h1">${grossPay}</Heading>
      <Text>{t('grossPayLabel')}</Text>
      <Heading as="h3">{t('regularHoursTitle')}</Heading>
      <FormProvider {...formHandlers}>
        <Form>
          <NumberInputField defaultValue={40} isRequired label={t('hoursLabel')} name="hours" />
        </Form>
      </FormProvider>

      <Button onClick={onDone} title={t('doneButton')}>
        {t('doneButton')}
      </Button>
    </Flex>
  )
}
