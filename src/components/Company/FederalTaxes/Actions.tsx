import { useTranslation } from 'react-i18next'
import { useFederalTaxes } from './useFederalTaxes'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export const Actions = () => {
  const { t } = useTranslation('Company.FederalTaxes')
  const { isPending } = useFederalTaxes()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
