import { useTranslation } from 'react-i18next'
import { useBankAccount } from './context'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { handleContinue, handleChange } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')

  return (
    <ActionsLayout>
      <Button onPress={handleChange} variant="secondary">
        {t('changeBankAccountCta')}
      </Button>
      <Button onPress={handleContinue} variant="primary">
        {t('continueCta')}
      </Button>
    </ActionsLayout>
  )
}
