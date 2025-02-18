import { useTranslation } from 'react-i18next'
import { Button, ActionsLayout } from '@/components/Common'
import { useInviteSignatory } from './InviteSignatory'

export const Actions = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { isPending } = useInviteSignatory()

  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('buttons.invite')}
      </Button>
    </ActionsLayout>
  )
}
