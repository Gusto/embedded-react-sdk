import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { useTaxes } from './useTaxes'

export const Actions = () => {
  const { isPending, handleCancel } = useTaxes()
  const { t } = useTranslation('Employee.Taxes')
  return (
    <Flex justifyContent="center">
      <Button type="button" onPress={handleCancel} variant="secondary">
        {t('cancelCta')}
      </Button>
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </Flex>
  )
}
