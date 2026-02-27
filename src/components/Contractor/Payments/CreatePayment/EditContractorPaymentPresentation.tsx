import { useId } from 'react'
import { FormProvider, useWatch, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout, Flex, Grid, NumberInputField, RadioGroupField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import type { RadioGroupOption } from '@/index'

export const EditContractorPaymentFormSchema = z.object({
  wageType: z.enum(['Hourly', 'Fixed']),
  hours: z.number().nonnegative().max(20000).optional(),
  wage: z.number().nonnegative().optional(),
  bonus: z.number().nonnegative().optional(),
  reimbursement: z.number().nonnegative().optional(),
  paymentMethod: z.enum(['Check', 'Direct Deposit', 'Historical Payment']),
  hourlyRate: z.number().nonnegative().optional(),
  contractorUuid: z.string(),
})

export type EditContractorPaymentFormValues = z.infer<typeof EditContractorPaymentFormSchema>

interface EditContractorPaymentPresentationProps {
  isOpen: boolean
  onClose: () => void
  formMethods: UseFormReturn<EditContractorPaymentFormValues>
  onSubmit: (data: EditContractorPaymentFormValues) => void
  contractorPaymentMethod?: string
}

export const EditContractorPaymentPresentation = ({
  isOpen,
  onClose,
  formMethods,
  onSubmit,
  contractorPaymentMethod,
}: EditContractorPaymentPresentationProps) => {
  const formId = useId()
  useI18n('Contractor.Payments.CreatePayment')
  const { t } = useTranslation('Contractor.Payments.CreatePayment', {
    keyPrefix: 'editContractorPayment',
  })
  const { Modal, Button, Text, Heading } = useComponentContext()
  const currencyFormatter = useNumberFormatter('currency')

  const wageType = useWatch<EditContractorPaymentFormValues, 'wageType'>({
    name: 'wageType',
    control: formMethods.control,
  })
  const hours = useWatch<EditContractorPaymentFormValues, 'hours'>({
    name: 'hours',
    control: formMethods.control,
  })
  const wage = useWatch<EditContractorPaymentFormValues, 'wage'>({
    name: 'wage',
    control: formMethods.control,
  })
  const bonus = useWatch<EditContractorPaymentFormValues, 'bonus'>({
    name: 'bonus',
    control: formMethods.control,
  })
  const reimbursement = useWatch<EditContractorPaymentFormValues, 'reimbursement'>({
    name: 'reimbursement',
    control: formMethods.control,
  })
  const hourlyRate = useWatch<EditContractorPaymentFormValues, 'hourlyRate'>({
    name: 'hourlyRate',
    control: formMethods.control,
  })

  const totalAmount =
    (wageType === 'Fixed' ? 0 : bonus || 0) +
    (reimbursement || 0) +
    (wage || 0) +
    (hours || 0) * (hourlyRate || 0)

  const isDirectDepositDisabled = contractorPaymentMethod === 'Check'

  const paymentMethodOptions: RadioGroupOption[] = [
    { value: 'Check', label: t('paymentMethods.check') },
    {
      value: 'Direct Deposit',
      label: t('paymentMethods.directDeposit'),
      isDisabled: isDirectDepositDisabled,
    },
    // { value: 'Historical Payment', label: t('paymentMethods.historicalPayment') },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <ActionsLayout>
          <Button variant="secondary" onClick={onClose}>
            {t('cancelCta')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            onClick={() => formMethods.handleSubmit(onSubmit)}
          >
            {t('saveCta')}
          </Button>
        </ActionsLayout>
      }
    >
      <FormProvider {...formMethods}>
        <Form id={formId} onSubmit={formMethods.handleSubmit(onSubmit)}>
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
                  min={0}
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
                <NumberInputField
                  min={0}
                  name="wage"
                  isRequired
                  label={t('wageLabel')}
                  format="currency"
                />
              </Flex>
            )}

            <Flex flexDirection="column" gap={16}>
              <Heading as="h3">{t('additionalEarningsSection')}</Heading>
              <Grid gridTemplateColumns={{ base: '1fr', small: [200, 200] }} gap={16}>
                {wageType === 'Hourly' && (
                  <NumberInputField
                    min={0}
                    name="bonus"
                    label={t('bonusLabel')}
                    format="currency"
                  />
                )}
                <NumberInputField
                  min={0}
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
          </Flex>
        </Form>
      </FormProvider>
    </Modal>
  )
}
