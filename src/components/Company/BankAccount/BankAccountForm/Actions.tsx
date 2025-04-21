import { useTranslation } from 'react-i18next'
import { useBankAccountForm } from './context'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.BankAccount')
  const { isPending } = useBankAccountForm()

  return (
    <ActionsLayout>
      <Button
        type="submit"
        variant="primary"
        isLoading={isPending}
        data-testid="bank-account-submit"
      >
        {t('continueCta')}
      </Button>
    </ActionsLayout>
  )
}
