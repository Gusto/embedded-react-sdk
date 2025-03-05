import { useTranslation } from 'react-i18next'
import { useIndustryApiState } from './Context'
import { ActionsLayout, Button } from '@/components/Common'

export const Actions = () => {
  const { t } = useTranslation('Company.Industry')
  const { isPending } = useIndustryApiState()

  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </ActionsLayout>
  )
}
