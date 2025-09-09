import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Flex, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'

interface PayrollEditEmployeeProps {
  onDone: () => void
}

export const PayrollEditEmployeePresentation = ({ onDone }: PayrollEditEmployeeProps) => {
  const { Button, Heading, Text } = useComponentContext()
  useI18n('Payroll.PayrollEditEmployee')
  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  const formHandlers = useForm()
  return (
    <Flex flexDirection="column" gap={20}>
      <Heading as="h2">{t('pageTitle', { employeeName: 'Hannah Arendt' })}</Heading>
      <Heading as="h1">$1,173.08</Heading>
      <Text>{t('labels.grossPay')}</Text>
      <Heading as="h3">{t('labels.regularHours')}</Heading>
      <FormProvider {...formHandlers}>
        <Form>
          <NumberInputField defaultValue={40} isRequired label={t('labels.hours')} name="hours" />
        </Form>
      </FormProvider>

      <Button onClick={onDone} title={t('buttons.doneTitle')}>
        {t('buttons.done')}
      </Button>
    </Flex>
  )
}
