import { FormProvider, useForm } from 'react-hook-form'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useTranslation } from 'react-i18next'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Flex, Grid, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'

interface PayrollEditEmployeeProps {
  onSave: () => void
  onCancel: () => void
  employee: Employee
  employeeCompensation?: PayrollEmployeeCompensationsType
  grossPay: number
}

export const PayrollEditEmployeeFormSchema = z.object({
  hours: z.number(),
  overtime: z.number(),
  doubleOvertime: z.number(),
})

export type PayrollEditEmployeeFormValues = z.infer<typeof PayrollEditEmployeeFormSchema>

export const PayrollEditEmployeePresentation = ({
  onSave,
  onCancel,
  employee,
  grossPay,
  employeeCompensation,
}: PayrollEditEmployeeProps) => {
  const { Button, Heading, Text } = useComponentContext()

  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  const formHandlers = useForm<PayrollEditEmployeeFormValues>({
    resolver: zodResolver(PayrollEditEmployeeFormSchema),
  })

  const employeeName = `${employee.firstName} ${employee.lastName}`

  return (
    <Flex flexDirection="column" gap={20}>
      <Flex justifyContent="space-between">
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">{t('pageTitle', { employeeName })}</Heading>
          <Heading as="h1">{formatNumberAsCurrency(grossPay || 0)}</Heading>
          <Text>{t('grossPayLabel')}</Text>
        </Flex>
        <Flex gap={12} justifyContent="flex-end">
          <Button variant="secondary" onClick={onCancel} title={t('cancelButton')}>
            {t('cancelButton')}
          </Button>
          <Button onClick={onSave} title={t('saveButton')}>
            {t('saveButton')}
          </Button>
        </Flex>
      </Flex>
      <Heading as="h3">{t('regularHoursTitle')}</Heading>
      <FormProvider {...formHandlers}>
        <Form>
          <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
            <NumberInputField
              defaultValue={40}
              isRequired
              label={t('hoursUnit')}
              name="hours"
              adornmentEnd={t('hoursUnit')}
            />
            <NumberInputField
              defaultValue={0}
              isRequired
              label={t('overtimeLabel')}
              name="overtime"
              adornmentEnd={t('hoursUnit')}
            />
            <NumberInputField
              defaultValue={0}
              isRequired
              label={t('doubleOvertimeLabel')}
              name="doubleOvertime"
              adornmentEnd={t('hoursUnit')}
            />
          </Grid>
        </Form>
      </FormProvider>
    </Flex>
  )
}
