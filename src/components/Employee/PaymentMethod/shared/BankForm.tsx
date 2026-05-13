import { FormProvider, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { usePaymentMethod, type UsePaymentMethodParams } from './usePaymentMethod'
import type { CombinedSchemaInputs } from './paymentMethodSchema'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { RadioGroupField, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'

function BankAccountFormFields() {
  const { t } = useTranslation('Employee.PaymentMethod')
  const { setValue } = useFormContext<CombinedSchemaInputs>()
  setValue('hasBankPayload', true)

  return (
    <>
      <TextInputField
        name="name"
        isRequired
        label={t('nameLabel')}
        errorMessage={t('validations.accountName')}
      />
      <TextInputField
        name="routingNumber"
        label={t('routingNumberLabel')}
        isRequired
        description={t('routingNumberDescription')}
        errorMessage={t('validations.routingNumber')}
      />
      <TextInputField
        name="accountNumber"
        label={t('accountNumberLabel')}
        errorMessage={t('validations.accountNumber')}
        isRequired
      />
      <RadioGroupField
        name="accountType"
        isRequired
        label={t('accountTypeLabel')}
        options={[
          { value: 'Checking', label: t('accountTypeChecking') },
          { value: 'Savings', label: t('accountTypeSavings') },
        ]}
      />
    </>
  )
}

export function BankForm({ employeeId, isAdmin, onEvent }: UsePaymentMethodParams) {
  const { formMethods, isPending, handleBankAccountSubmit, resetToDefaults } = usePaymentMethod({
    employeeId,
    isAdmin,
    onEvent,
  })
  const { handleSubmit, setValue } = formMethods
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  // Bank form is always Direct Deposit — force the type so the submit handler validates correctly
  setValue('type', PAYMENT_METHODS.directDeposit)

  const handleCancel = () => {
    resetToDefaults()
    onEvent(componentEvents.CANCEL)
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={handleSubmit(handleBankAccountSubmit)}>
        <BankAccountFormFields />
        <ActionsLayout>
          <Components.Button variant="secondary" type="button" onClick={handleCancel}>
            {t('cancelAddCta')}
          </Components.Button>
          <Components.Button type="submit" isLoading={isPending}>
            {t('saveCta')}
          </Components.Button>
        </ActionsLayout>
      </Form>
    </FormProvider>
  )
}
