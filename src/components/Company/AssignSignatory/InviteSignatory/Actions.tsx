import { useTranslation } from 'react-i18next'
import { useInviteSignatory } from './useInviteSignatory'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Actions = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { isPending } = useInviteSignatory()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('buttons.inviteSignatory')}
      </Components.Button>
    </ActionsLayout>
  )
}
