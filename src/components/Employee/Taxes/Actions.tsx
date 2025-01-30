import { useTranslation } from 'react-i18next'
import { ActionsLayout, Button } from '@/components/Common'
import { useTaxes } from '@/components/Employee/Taxes/Taxes'

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
