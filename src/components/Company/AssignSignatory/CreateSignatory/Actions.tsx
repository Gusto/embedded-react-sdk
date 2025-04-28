import { useTranslation } from 'react-i18next'
import { useCreateSignatory } from './useCreateSignatory'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Actions = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const { isPending } = useCreateSignatory()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('buttons.signDocuments')}
      </Components.Button>
    </ActionsLayout>
  )
}
