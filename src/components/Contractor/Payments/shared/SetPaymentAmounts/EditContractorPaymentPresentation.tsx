import { useId, useState } from 'react'
import { FormProvider, useWatch, type UseFormReturn } from 'react-hook-form'
import type { PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import type { EditContractorPaymentFormValues } from './EditContractorPaymentFormSchema'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ActionsLayout, Flex, NumberInputField, RadioGroupField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import type { RadioGroupOption } from '@/index'

/**
 * Every string the edit-contractor-pay modal renders. `hoursPayDescription` is a formatter
 * rather than a translated string, since the rate/total it displays are computed at render
 * time and there's no i18next instance backing this component to interpolate them.
 *
 * @internal
 */
export interface EditContractorPaymentDictionary {
  title: string
  subtitle: string
  hoursLabel: string
  hoursAdornment: string
  hoursPayDescription: (rate: string, total: string) => string
  wageLabel: string
  bonusLabel: string
  reimbursementLabel: string
  paymentMethodLabel: string
  cancelCta: string
  saveCta: string
  paymentMethods: {
    check: string
    directDeposit: string
    historicalPayment: string
  }
  errors: {
    directDepositNotAvailable: string
    unsupportedPaymentMethod: string
  }
}

interface EditContractorPaymentPresentationProps {
  isOpen: boolean
  onClose: () => void
  formMethods: UseFormReturn<EditContractorPaymentFormValues>
  onSubmit: (data: EditContractorPaymentFormValues) => void
  allowedPaymentMethods: ContractorPaymentMethod[]
  contractorPaymentMethod?: string
  dictionary: EditContractorPaymentDictionary
}

/** @internal */
export const EditContractorPaymentPresentation = ({
  isOpen,
  onClose,
  formMethods,
  onSubmit,
  allowedPaymentMethods,
  contractorPaymentMethod,
  dictionary,
}: EditContractorPaymentPresentationProps) => {
  const formId = useId()
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

  const computeHoursPayDescription = (hours: number) => {
    if (!hourlyRate || hourlyRate <= 0) return ''
    return dictionary.hoursPayDescription(
      currencyFormatter(hourlyRate),
      currencyFormatter(hours * hourlyRate),
    )
  }

  const initialHours = formMethods.getValues('hours')
  const [hoursPayDescription, setHoursPayDescription] = useState(
    computeHoursPayDescription(
      typeof initialHours === 'undefined' || Number.isNaN(initialHours) ? 0 : initialHours,
    ),
  )

  const isDirectDepositDisabled = contractorPaymentMethod === 'Check'

  const paymentMethodErrorCode = formMethods.formState.errors.paymentMethod?.message
  const paymentMethodErrorMessage =
    paymentMethodErrorCode === 'directDepositNotAvailable'
      ? dictionary.errors.directDepositNotAvailable
      : paymentMethodErrorCode === 'unsupportedPaymentMethod'
        ? dictionary.errors.unsupportedPaymentMethod
        : undefined

  const paymentMethodLabels: Record<ContractorPaymentMethod, string> = {
    Check: dictionary.paymentMethods.check,
    'Direct Deposit': dictionary.paymentMethods.directDeposit,
    'Historical Payment': dictionary.paymentMethods.historicalPayment,
  }
  const paymentMethodOptions: RadioGroupOption[] = allowedPaymentMethods.map(method => ({
    value: method,
    label: paymentMethodLabels[method],
    isDisabled: method === 'Direct Deposit' && isDirectDepositDisabled,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <ActionsLayout>
          <Button variant="secondary" onClick={onClose}>
            {dictionary.cancelCta}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            onClick={() => formMethods.handleSubmit(onSubmit)}
          >
            {dictionary.saveCta}
          </Button>
        </ActionsLayout>
      }
    >
      <FormProvider {...formMethods}>
        <Form id={formId} onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex flexDirection="column" gap={32}>
            <Flex flexDirection="column" gap={4}>
              <Heading as="h2">{dictionary.title}</Heading>
              <Text variant="supporting">{dictionary.subtitle}</Text>
            </Flex>
            <Flex flexDirection="column" gap={20}>
              {wageType === 'Hourly' && (
                <NumberInputField
                  min={0}
                  name="hours"
                  isRequired
                  label={dictionary.hoursLabel}
                  adornmentEnd={dictionary.hoursAdornment}
                  description={hourlyRate && hourlyRate > 0 ? hoursPayDescription : undefined}
                  onInputChange={raw => {
                    setHoursPayDescription(computeHoursPayDescription(parseHours(raw)))
                  }}
                />
              )}

              {wageType === 'Fixed' && (
                <NumberInputField
                  min={0}
                  name="wage"
                  isRequired
                  label={dictionary.wageLabel}
                  format="currency"
                />
              )}

              {wageType === 'Hourly' && (
                <NumberInputField
                  min={0}
                  name="bonus"
                  label={dictionary.bonusLabel}
                  format="currency"
                />
              )}
              <NumberInputField
                min={0}
                name="reimbursement"
                label={dictionary.reimbursementLabel}
                format="currency"
              />
            </Flex>

            {allowedPaymentMethods.length > 1 && (
              <Flex flexDirection="column" gap={16}>
                <RadioGroupField
                  name="paymentMethod"
                  options={paymentMethodOptions}
                  label={dictionary.paymentMethodLabel}
                  errorMessage={paymentMethodErrorMessage}
                />
              </Flex>
            )}
          </Flex>
        </Form>
      </FormProvider>
    </Modal>
  )
}
