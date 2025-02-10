import { useTranslation } from 'react-i18next'
import { ActionsLayout, Button } from '@/components/Common'
import { useIndustryForm } from './Industry'

export const Actions = () => {
  const { t } = useTranslation('Company.Industry')
  const { isPending } = useIndustryForm()

  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </ActionsLayout>
  )
}
