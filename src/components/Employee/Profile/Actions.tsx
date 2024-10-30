import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { useProfile } from '@/components/Employee/Profile/Profile'

export const Actions = () => {
  const { handleCancel, isPending } = useProfile()
  const { t } = useTranslation('Employee.Profile')
  return (
    <Flex gap={8}>
      <Button type="button" onPress={handleCancel} variant="secondary">
        {t('cancelCta')}
      </Button>
      <Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Button>
    </Flex>
  )
}
