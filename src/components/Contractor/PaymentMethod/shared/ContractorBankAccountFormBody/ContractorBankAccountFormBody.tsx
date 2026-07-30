import { useTranslation } from 'react-i18next'
import type { ContractorBankAccount } from '@gusto/embedded-api/models/components/contractorbankaccount'
import { useContractorBankAccountForm } from '../useContractorBankAccountForm'
import type { UseContractorBankAccountFormProps } from '../useContractorBankAccountForm'
import {
  ContractorBankAccountFields,
  type ContractorBankAccountFieldsDictionary,
} from '../ContractorBankAccountFields'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { BaseLayout } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { LoaderComponentType } from '@/components/Base'

/** @internal */
export interface ContractorBankAccountFormBodyProps extends Omit<
  UseContractorBankAccountFormProps,
  'contractorId'
> {
  /** The associated contractor identifier. */
  contractorId: string
  /**
   * Translation overrides for the form's strings. Each consuming surface
   * passes the dictionary it resolved from its own namespace so a partner
   * override on one surface doesn't leak into the other.
   */
  dictionary?: ContractorBankAccountFieldsDictionary
  /** Called with the created bank account after a successful submit. */
  onSaved: (bankAccount: ContractorBankAccount) => void
  onCancel?: () => void
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Shared bank-account form body. Owns the `useContractorBankAccountForm`
 * composition, the shared field set, and the submit/cancel actions. Reads
 * its copy from the internal `Contractor.BankAccountFields` namespace;
 * consuming surfaces inject their own copy via the `dictionary` prop and map
 * the `onSaved`/`onCancel` callbacks onto their surface-specific events.
 *
 * @internal
 */
export function ContractorBankAccountFormBody({
  contractorId,
  dictionary,
  onSaved,
  onCancel,
  LoaderComponent,
  ...hookProps
}: ContractorBankAccountFormBodyProps) {
  useI18n('Contractor.BankAccountFields')
  useComponentDictionary('Contractor.BankAccountFields', dictionary)
  const bankAccountForm = useContractorBankAccountForm({ contractorId, ...hookProps })
  const { t } = useTranslation('Contractor.BankAccountFields')
  const Components = useComponentContext()

  if (bankAccountForm.isLoading) {
    return (
      <BaseLayout
        isLoading
        error={bankAccountForm.errorHandling.errors}
        LoaderComponent={LoaderComponent}
      />
    )
  }

  const handleSubmit = async () => {
    const result = await bankAccountForm.actions.onSubmit()
    if (result) {
      onSaved(result.data)
    }
  }

  return (
    <BaseLayout error={bankAccountForm.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <SDKFormProvider formHookResult={bankAccountForm}>
        <Form onSubmit={handleSubmit}>
          <ContractorBankAccountFields bankAccountForm={bankAccountForm} dictionary={dictionary} />
          <ActionsLayout>
            {onCancel && (
              <Components.Button variant="secondary" type="button" onClick={onCancel}>
                {t('cancelCta')}
              </Components.Button>
            )}
            <Components.Button type="submit" isLoading={bankAccountForm.status.isPending}>
              {t('saveCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}
