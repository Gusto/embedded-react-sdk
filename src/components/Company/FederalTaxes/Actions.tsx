import { useTranslation } from 'react-i18next'
import { useFederalTaxes } from './useFederalTaxes'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.FederalTaxes')
  const { isPending } = useFederalTaxes()

  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('continueCta')}
      </Button>
    </ActionsLayout>
  )
}
