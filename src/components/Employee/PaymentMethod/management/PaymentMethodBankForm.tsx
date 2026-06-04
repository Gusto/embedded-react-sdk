import { useTranslation } from 'react-i18next'
import { useBankForm, type AccountType, type UseBankFormProps } from '../shared/useBankForm'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaymentMethodBankFormProps extends Omit<UseBankFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone bank-account form for the management flow. Owns its own data via
 * {@link useBankForm} and emits the per-component scoped events
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED` and
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED`. Reads its copy from
 * the dedicated `Employee.Management.PaymentMethodBankForm` namespace so partner
 * overrides on the management bank form don't leak into the onboarding form.
 */
export function PaymentMethodBankForm({
  employeeId,
  onEvent,
  ...hookProps
}: PaymentMethodBankFormProps) {
  useI18n('Employee.Management.PaymentMethodBankForm')
  const bankForm = useBankForm({ employeeId, ...hookProps })
  const { t } = useTranslation('Employee.Management.PaymentMethodBankForm')
  const Components = useComponentContext()

  if (bankForm.isLoading) {
    return <BaseLayout isLoading error={bankForm.errorHandling.errors} />
  }

  const { Fields } = bankForm.form

  const handleSubmit = async () => {
    const result = await bankForm.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED, result.data)
    }
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED)
  }

  return (
    <BaseLayout error={bankForm.errorHandling.errors}>
      <SDKFormProvider formHookResult={bankForm}>
        <Form onSubmit={handleSubmit}>
          <Fields.Name
            label={t('nameLabel')}
            validationMessages={{ REQUIRED: t('validations.accountName') }}
          />
          <Fields.RoutingNumber
            label={t('routingNumberLabel')}
            description={t('routingNumberDescription')}
            validationMessages={{
              REQUIRED: t('validations.routingNumber'),
              INVALID_ROUTING_NUMBER: t('validations.routingNumber'),
            }}
          />
          <Fields.AccountNumber
            label={t('accountNumberLabel')}
            validationMessages={{
              REQUIRED: t('validations.accountNumber'),
              INVALID_ACCOUNT_NUMBER: t('validations.accountNumberFormat'),
            }}
          />
          <Fields.AccountType
            label={t('accountTypeLabel')}
            getOptionLabel={(type: AccountType) =>
              type === 'Checking' ? t('accountTypeChecking') : t('accountTypeSavings')
            }
          />
          <ActionsLayout>
            <Components.Button variant="secondary" type="button" onClick={handleCancel}>
              {t('cancelCta')}
            </Components.Button>
            <Components.Button type="submit" isLoading={bankForm.status.isPending}>
              {t('saveCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}
