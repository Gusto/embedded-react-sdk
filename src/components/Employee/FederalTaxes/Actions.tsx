import { useTranslation } from 'react-i18next'
import { useFederalTaxes } from './useFederalTaxes'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Employee.FederalTaxes')
  const { isPending } = useFederalTaxes()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
