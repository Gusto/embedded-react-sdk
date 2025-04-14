import { useTranslation } from 'react-i18next'
import { useTaxes } from './useTaxes'
import { ActionsLayout, Button } from '@/components/Common'

export const Actions = () => {
  const { isPending } = useTaxes()
  const { t } = useTranslation('Employee.Taxes')
  return (
    <ActionsLayout>
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </ActionsLayout>
  )
}
