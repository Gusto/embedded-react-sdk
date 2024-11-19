import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { useProfile } from '@/components/Employee/Profile/Profile'

export const Actions = () => {
  const { isPending } = useProfile()
  const { t } = useTranslation('Employee.Profile')
  return (
    <Flex gap="sm" justifyContent="flex-end">
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </Flex>
  )
}
