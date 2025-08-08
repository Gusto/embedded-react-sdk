import { useTranslation } from 'react-i18next'
import { ActionsLayout } from '@/components/Common'
import { useStateTaxes } from './useStateTaxes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Employee.Taxes')
  const { isPending } = useStateTaxes()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
