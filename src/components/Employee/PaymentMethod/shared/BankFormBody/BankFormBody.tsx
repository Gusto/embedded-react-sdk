import { useTranslation } from 'react-i18next'
import type { EmployeeBankAccount } from '@gusto/embedded-api-v-2025-11-15/models/components/employeebankaccount'
import { useBankForm, type AccountType, type UseBankFormProps } from '../useBankForm'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { ResourceDictionary } from '@/types/Helpers'

/** @internal */
export type BankFormBodyDictionary = ResourceDictionary<'Employee.BankFormBody'>

/** @internal */
export interface BankFormBodyProps extends Omit<UseBankFormProps, 'employeeId'> {
  employeeId: string
  /**
   * Translation overrides for the form's strings. Each consuming surface passes
   * the dictionary it resolved from its own namespace so partner overrides on
   * that namespace flow into the shared form text.
   */
  dictionary?: BankFormBodyDictionary
  /** Called with the created bank account after a successful submit. */
  onSaved: (bankAccount: EmployeeBankAccount) => void
  onCancel: () => void
}

/**
 * Shared bank-account form body. Owns the `useBankForm` composition, the field
 * JSX, and the submit/cancel actions. Reads its copy from the internal
 * `Employee.BankFormBody` namespace; consuming surfaces inject their own copy
 * via the `dictionary` prop and map the `onSaved`/`onCancel` callbacks onto
 * their surface-specific events.
 *
 * @internal
 */
export function BankFormBody({
  employeeId,
  dictionary,
  onSaved,
  onCancel,
  ...hookProps
}: BankFormBodyProps) {
  useI18n('Employee.BankFormBody')
  useComponentDictionary('Employee.BankFormBody', dictionary)
  const bankForm = useBankForm({ employeeId, ...hookProps })
  const { t } = useTranslation('Employee.BankFormBody')
  const Components = useComponentContext()

  if (bankForm.isLoading) {
    return <BaseLayout isLoading error={bankForm.errorHandling.errors} />
  }

  const { Fields } = bankForm.form

  const handleSubmit = async () => {
    const result = await bankForm.actions.onSubmit()
    if (result) {
      onSaved(result.data)
    }
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
            <Components.Button variant="secondary" type="button" onClick={onCancel}>
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
