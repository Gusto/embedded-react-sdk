import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { useCompensation } from '@/components/Employee/Compensation'

export const Actions = () => {
  const { handleCancel, isPending, mode, submitWithEffect } = useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  return (
    <Flex justifyContent="center">
      <Button
        type="button"
        onPress={handleCancel}
        variant="secondary"
        isDisabled={mode === 'EDIT' || mode === 'ADD'}
      >
        {t('cancelCta')}
      </Button>
      <Button
        onPress={() => {
          submitWithEffect('PROCEED')
        }}
        isLoading={isPending}
        isDisabled={mode === 'EDIT' || mode === 'ADD'}
      >
        {t('submitCta')}
      </Button>
    </Flex>
  )
}
