import { useTranslation } from 'react-i18next'
import { ActionsLayout, Button } from '@/components/Common'
import { useProfile } from '@/components/Employee/Profile/Profile'

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
