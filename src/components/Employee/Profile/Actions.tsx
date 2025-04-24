import { useTranslation } from 'react-i18next'
import { useProfile } from './useProfile'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Actions = () => {
  const { t } = useTranslation('Employee.Profile')
  const { isPending } = useProfile()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
