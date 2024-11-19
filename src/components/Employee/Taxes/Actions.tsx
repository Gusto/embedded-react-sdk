import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { useTaxes } from '@/components/Employee/Taxes/Taxes'

export const Actions = () => {
  const { isPending } = useTaxes()
  const { t } = useTranslation('Employee.Taxes')
  return (
    <Flex justifyContent="flex-end">
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </Flex>
  )
}
