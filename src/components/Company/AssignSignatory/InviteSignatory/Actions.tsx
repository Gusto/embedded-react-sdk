import { useTranslation } from 'react-i18next'
import { useInviteSignatory } from './InviteSignatory'
import { Button, ActionsLayout } from '@/components/Common'

export const Actions = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { isPending } = useInviteSignatory()

  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('buttons.inviteSignatory')}
      </Button>
    </ActionsLayout>
  )
}
