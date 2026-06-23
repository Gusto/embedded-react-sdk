import { useCallback, useId, useRef } from 'react'
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

  // react-aria's NumberField only commits to the form on blur, so the form
  // value lags behind keystrokes. Update the description text imperatively
  // from the live DOM input value — re-rendering on every keystroke fights
  // with NumberField's internal input state and breaks typing.
  const initialHours = formMethods.getValues('hours') || 0
  const computeDescription = (hours: number) => {
    if (!hourlyRate || hourlyRate <= 0) return ''
    return t('hoursPayDescription', {
      rate: currencyFormatter(hourlyRate),
      total: currencyFormatter(hours * hourlyRate),
    })
  }
  const hoursDescriptionRef = useRef<HTMLSpanElement>(null)
  const hoursInputCleanupRef = useRef<(() => void) | null>(null)
  const hoursInputRef = useCallback(
    (input: HTMLInputElement | null) => {
      hoursInputCleanupRef.current?.()
      hoursInputCleanupRef.current = null
      if (!input) return
      const sync = () => {
        if (!hoursDescriptionRef.current) return
        const parsed = parseFloat(input.value.replace(/[^\d.]/g, ''))
        const hours = isNaN(parsed) ? 0 : parsed
        hoursDescriptionRef.current.textContent = computeDescription(hours)
      }
      input.addEventListener('input', sync)
      hoursInputCleanupRef.current = () => {
        input.removeEventListener('input', sync)
      }
    },
    // computeDescription is recreated each render, but the listener only
    // needs to re-attach when hourlyRate changes (which is what affects the
    // computation).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hourlyRate],
  )

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
                <Flex flexDirection="column" gap={4}>
                  <NumberInputField
                    min={0}
                    name="hours"
                    isRequired
                    label={t('hoursLabel')}
                    adornmentEnd={t('hoursAdornment')}
                    inputRef={hoursInputRef}
                  />
                  {hourlyRate && hourlyRate > 0 && (
                    <Text size="sm" variant="supporting">
                      <span ref={hoursDescriptionRef}>{computeDescription(initialHours)}</span>
                    </Text>
                  )}
                </Flex>
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
