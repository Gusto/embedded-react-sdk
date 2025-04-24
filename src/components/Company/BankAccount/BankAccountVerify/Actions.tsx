import { useTranslation } from 'react-i18next'
import { useBankAccountVerify } from './context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Company.BankAccount')
  const { isPending, handleCancel } = useBankAccountVerify()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button
        variant="secondary"
        isLoading={isPending}
        onClick={handleCancel}
        data-testid="bank-account-verify-cancel"
      >
        {t('cancelCta')}
      </Components.Button>
      <Components.Button
        type="submit"
        isLoading={isPending}
        data-testid="bank-account-verify-submit"
      >
        {t('verifyCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
