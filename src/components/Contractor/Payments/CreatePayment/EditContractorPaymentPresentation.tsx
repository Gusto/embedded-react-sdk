import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, Grid, NumberInputField, RadioGroupField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'

export const EditContractorPaymentFormSchema = z
  .object({
    wageType: z.enum(['Hourly', 'Fixed']),
    hours: z.number().optional(),
    wage: z.number().optional(),
    bonus: z.number().optional(),
    reimbursement: z.number().optional(),
    paymentMethod: z.enum(['Check', 'Direct Deposit', 'Historical Payment']),
    hourlyRate: z.number().optional(),
    contractorUuid: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.wageType === 'Hourly' && (data.hours === undefined || data.hours <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hours is required when wage type is Hourly',
        path: ['hours'],
      })
    }
    if (data.wageType === 'Fixed' && (data.wage === undefined || data.wage <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wage is required when wage type is Fixed',
        path: ['wage'],
      })
    }
  })

export type EditContractorPaymentFormValues = z.infer<typeof EditContractorPaymentFormSchema>

interface EditPaymentProps {
  onSave: () => void
  onCancel: () => void
}

export const EditContractorPaymentPresentation = ({ onSave, onCancel }: EditPaymentProps) => {
  useI18n('Contractor.Payments.CreatePayment')
  const { t } = useTranslation('Contractor.Payments.CreatePayment', {
    keyPrefix: 'editContractorPayment',
  })
  const { Button, Text, Heading } = useComponentContext()
  const currencyFormatter = useNumberFormatter('currency')

  const wageType = useWatch<EditContractorPaymentFormValues, 'wageType'>({ name: 'wageType' })
  const hours = useWatch<EditContractorPaymentFormValues, 'hours'>({ name: 'hours' })
  const wage = useWatch<EditContractorPaymentFormValues, 'wage'>({ name: 'wage' })
  const bonus = useWatch<EditContractorPaymentFormValues, 'bonus'>({ name: 'bonus' })
  const reimbursement = useWatch<EditContractorPaymentFormValues, 'reimbursement'>({
    name: 'reimbursement',
  })
  const hourlyRate = useWatch<EditContractorPaymentFormValues, 'hourlyRate'>({ name: 'hourlyRate' })

  const totalAmount =
    (bonus || 0) + (reimbursement || 0) + (wage || 0) + (hours || 0) * (hourlyRate || 0)

  const paymentMethodOptions = [
    { value: 'Check', label: t('paymentMethods.check') },
    { value: 'Direct Deposit', label: t('paymentMethods.directDeposit') },
    { value: 'Historical Payment', label: t('paymentMethods.historicalPayment') },
  ]

  return (
    <Form onSubmit={onSave}>
      <Flex flexDirection="column" gap={32}>
        <Flex flexDirection="column" gap={16}>
          <Heading as="h2">{t('title')}</Heading>
          <Text>{t('subtitle')}</Text>
          <Text weight="bold">
            {t('totalPay')}: {currencyFormatter(totalAmount)}
          </Text>
        </Flex>

        {wageType === 'Hourly' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">{t('hoursSection')}</Heading>
            <NumberInputField
              name="hours"
              isRequired
              label={t('hoursLabel')}
              adornmentEnd={t('hoursAdornment')}
            />
          </Flex>
        )}

        {wageType === 'Fixed' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">{t('fixedPaySection')}</Heading>
            <NumberInputField name="wage" isRequired label={t('wageLabel')} format="currency" />
          </Flex>
        )}

        <Flex flexDirection="column" gap={16}>
          <Heading as="h3">{t('additionalEarningsSection')}</Heading>
          <Grid gridTemplateColumns={{ base: '1fr', small: [200, 200] }} gap={16}>
            <NumberInputField name="bonus" label={t('bonusLabel')} format="currency" />
            <NumberInputField
              name="reimbursement"
              label={t('reimbursementLabel')}
              format="currency"
            />
          </Grid>
        </Flex>

        <Flex flexDirection="column" gap={16}>
          <RadioGroupField
            name="paymentMethod"
            options={paymentMethodOptions}
            label={t('paymentMethodLabel')}
          />
        </Flex>

        <Flex justifyContent="flex-end" gap={16}>
          <Button onClick={onCancel} variant="secondary" type="button">
            {t('cancelCta')}
          </Button>
          <Button variant="primary" type="submit">
            {t('saveCta')}
          </Button>
        </Flex>
      </Flex>
    </Form>
  )
}
