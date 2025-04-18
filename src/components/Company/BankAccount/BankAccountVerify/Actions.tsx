import { useTranslation } from 'react-i18next'
import { useBankAccountVerify } from './context'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.BankAccount')
  const { isPending, handleCancel } = useBankAccountVerify()

  return (
    <ActionsLayout>
      <Button
        variant="secondary"
        isLoading={isPending}
        onPress={handleCancel}
        data-testid="bank-account-verify-cancel"
      >
        {t('cancelCta')}
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isPending}
        data-testid="bank-account-verify-submit"
      >
        {t('verifyCta')}
      </Button>
    </ActionsLayout>
  )
}
