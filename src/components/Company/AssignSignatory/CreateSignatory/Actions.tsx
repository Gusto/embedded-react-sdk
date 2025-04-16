import { useTranslation } from 'react-i18next'
import { useCreateSignatory } from './useCreateSignatory'
import { Button, ActionsLayout } from '@/components/Common'

export const Actions = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { isPending } = useCreateSignatory()

  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('buttons.signDocuments')}
      </Button>
    </ActionsLayout>
  )
}
