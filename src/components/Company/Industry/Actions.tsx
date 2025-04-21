import { useTranslation } from 'react-i18next'
import { useIndustryApiState } from './Context'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export const Actions = () => {
  const { t } = useTranslation('Company.Industry')
  const { isPending } = useIndustryApiState()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
