import { useTranslation } from 'react-i18next'
import { useProfile } from './useProfile'
import { ActionsLayout, Button } from '@/components/Common'

export const Actions = () => {
  const { isPending } = useProfile()
  const { t } = useTranslation('Employee.Profile')
  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </ActionsLayout>
  )
}
