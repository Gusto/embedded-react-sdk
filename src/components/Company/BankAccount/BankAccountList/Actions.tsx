import { useTranslation } from 'react-i18next'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.BankAccount')

  return (
    <ActionsLayout>
      <Button onPress={() => {}} variant="secondary">
        {t('changeBankAccountCta')}
      </Button>
      <Button onPress={() => {}} variant="primary">
        {t('continueCta')}
      </Button>
    </ActionsLayout>
  )
}
