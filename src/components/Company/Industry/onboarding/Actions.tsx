import { useTranslation } from 'react-i18next'
import { useIndustryFormContext } from './Context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export const Actions = () => {
  const { t } = useTranslation('Company.Industry')
  const { status } = useIndustryFormContext()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={status.isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
