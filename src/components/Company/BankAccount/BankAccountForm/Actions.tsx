import { useTranslation } from 'react-i18next'
import { useBankAccountForm } from './context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Company.BankAccount')
  const { isPending } = useBankAccountForm()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending} data-testid="bank-account-submit">
        {t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
