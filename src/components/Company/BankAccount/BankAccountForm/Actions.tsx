import { useTranslation } from 'react-i18next'
import { useBankAccountForm } from './context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'

export function Actions() {
  const { t } = useTranslation('Company.BankAccount')
  const { isPending, isEditing, onEvent } = useBankAccountForm()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      {isEditing && (
        <Components.Button
          type="button"
          variant="secondary"
          onClick={() => {
            onEvent(componentEvents.COMPANY_BANK_ACCOUNT_CANCEL)
          }}
        >
          {t('cancelCta')}
        </Components.Button>
      )}
      <Components.Button type="submit" isLoading={isPending} data-testid="bank-account-submit">
        {t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
