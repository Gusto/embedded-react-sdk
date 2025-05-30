import { useTranslation } from 'react-i18next'
import { useAddress } from './useAddress'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Contractor.Address')
  const Components = useComponentContext()
  const { isPending } = useAddress()

  return (
    <ActionsLayout>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submit')}
      </Components.Button>
    </ActionsLayout>
  )
}
