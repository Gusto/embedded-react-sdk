import { useId } from 'react'
import { FormProvider, useWatch, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { EditHistoricalPaymentFormValues } from './EditHistoricalPaymentFormSchema'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout, Flex, Grid, NumberInputField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'

interface EditHistoricalPaymentPresentationProps {
  isOpen: boolean
  onClose: () => void
  formMethods: UseFormReturn<EditHistoricalPaymentFormValues>
  onSubmit: (data: EditHistoricalPaymentFormValues) => void
}

export const EditHistoricalPaymentPresentation = ({
  isOpen,
  onClose,
  formMethods,
  onSubmit,
}: EditHistoricalPaymentPresentationProps) => {
  const formId = useId()
  useI18n('Contractor.Payments.HistoricalPayments.CreateHistoricalPayment')
  const { t } = useTranslation('Contractor.Payments.HistoricalPayments.CreateHistoricalPayment', {
    keyPrefix: 'editContractorPayment',
  })
  const { Modal, Button, Text, Heading } = useComponentContext()
  const currencyFormatter = useNumberFormatter('currency')

  const wageType = useWatch<EditHistoricalPaymentFormValues, 'wageType'>({
    name: 'wageType',
    control: formMethods.control,
  })
  const hours = useWatch<EditHistoricalPaymentFormValues, 'hours'>({
    name: 'hours',
    control: formMethods.control,
  })
  const wage = useWatch<EditHistoricalPaymentFormValues, 'wage'>({
    name: 'wage',
    control: formMethods.control,
  })
  const bonus = useWatch<EditHistoricalPaymentFormValues, 'bonus'>({
    name: 'bonus',
    control: formMethods.control,
  })
  const reimbursement = useWatch<EditHistoricalPaymentFormValues, 'reimbursement'>({
    name: 'reimbursement',
    control: formMethods.control,
  })
  const hourlyRate = useWatch<EditHistoricalPaymentFormValues, 'hourlyRate'>({
    name: 'hourlyRate',
    control: formMethods.control,
  })

  const totalAmount =
    (wageType === 'Fixed' ? 0 : bonus || 0) +
    (reimbursement || 0) +
    (wage || 0) +
    (hours || 0) * (hourlyRate || 0)

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
          </Flex>
        </Form>
      </FormProvider>
    </Modal>
  )
}
