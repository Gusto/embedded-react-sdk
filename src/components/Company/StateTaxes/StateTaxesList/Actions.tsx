import { useTranslation } from 'react-i18next'
// import { useStateTaxesList } from './context'
import { Button, ActionsLayout } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.StateTaxes')
  //   const {  } = useStateTaxesList()

  return (
    <ActionsLayout>
      <Button variant="primary" onPress={() => {}}>
        {t('list.continueCta')}
      </Button>
    </ActionsLayout>
  )
}
