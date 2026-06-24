import { useEffect, useId, useState } from 'react'
import { FormProvider, useWatch, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { EditContractorPaymentFormValues } from './EditContractorPaymentFormSchema'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout, Flex, NumberInputField, RadioGroupField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useI18n } from '@/i18n'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import type { RadioGroupOption } from '@/index'

interface EditContractorPaymentPresentationProps {
  isOpen: boolean
  onClose: () => void
  formMethods: UseFormReturn<EditContractorPaymentFormValues>
  onSubmit: (data: EditContractorPaymentFormValues) => void
  contractorPaymentMethod?: string
}

/** @internal */
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
  const hourlyRate = useWatch<EditContractorPaymentFormValues, 'hourlyRate'>({
    name: 'hourlyRate',
    control: formMethods.control,
  })

  const parseHours = (raw: string) => {
    const parsed = parseFloat(raw.replace(/[^\d.]/g, ''))
    return isNaN(parsed) ? 0 : parsed
  }

  const [hoursPayDescription, setHoursPayDescription] = useState('')

  useEffect(() => {
    if (isOpen) {
      const computeHoursPayDescription = (hours: number) => {
        if (!hourlyRate || hourlyRate <= 0) return ''
        return t('hoursPayDescription', {
          rate: currencyFormatter(hourlyRate),
          total: currencyFormatter(hours * hourlyRate),
        })
      }
      setHoursPayDescription(computeHoursPayDescription(formMethods.getValues('hours') ?? 0))
    }
  }, [isOpen, hourlyRate, formMethods, t, currencyFormatter])

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
            <Flex flexDirection="column" gap={4}>
              <Heading as="h2">{t('title')}</Heading>
              <Text variant="supporting">{t('subtitle')}</Text>
            </Flex>
            <Flex flexDirection="column" gap={20}>
              {wageType === 'Hourly' && (
                <NumberInputField
                  min={0}
                  name="hours"
                  isRequired
                  label={t('hoursLabel')}
                  adornmentEnd={t('hoursAdornment')}
                  description={hourlyRate && hourlyRate > 0 ? hoursPayDescription : undefined}
                  onInputChange={raw => {
                    const hours = parseHours(raw)
                    if (!hourlyRate || hourlyRate <= 0) {
                      setHoursPayDescription('')
                    } else {
                      setHoursPayDescription(
                        t('hoursPayDescription', {
                          rate: currencyFormatter(hourlyRate),
                          total: currencyFormatter(hours * hourlyRate),
                        }),
                      )
                    }
                  }}
                />
              )}

              {wageType === 'Fixed' && (
                <NumberInputField
                  min={0}
                  name="wage"
                  isRequired
                  label={t('wageLabel')}
                  format="currency"
                />
              )}

              {wageType === 'Hourly' && (
                <NumberInputField min={0} name="bonus" label={t('bonusLabel')} format="currency" />
              )}
              <NumberInputField
                min={0}
                name="reimbursement"
                label={t('reimbursementLabel')}
                format="currency"
              />
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
