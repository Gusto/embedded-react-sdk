import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { useCompensation, type CompensationInputs } from '@/components/Employee/Compensation'
import { FlsaStatus } from '@/shared/constants'
import { useFormContext, useWatch } from 'react-hook-form'

export const Actions = () => {
  const { isPending, mode, submitWithEffect, handleAdd, handleCancelAddJob, primaryFlsaStatus } =
    useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  const { control } = useFormContext<CompensationInputs>()
  const watchFlsaStatus = useWatch({ control, name: 'flsa_status' })
  return (
    <Flex justifyContent="flex-end" alignItems="center">
      {watchFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'LIST' && (
        <Button
          variant="secondary"
          onPress={() => {
            handleAdd()
          }}
          isDisabled={isPending}
        >
          {t('addAnotherJobCta')}
        </Button>
      )}
      {primaryFlsaStatus === FlsaStatus.NONEXEMPT && (mode === 'EDIT' || mode === 'ADD') && (
        <Button variant="link" onPress={handleCancelAddJob} isDisabled={isPending}>
          {t('cancelNewJobCta')}
        </Button>
      )}
      <Button
        onPress={() => {
          submitWithEffect(mode === 'LIST' ? 'PROCEED' : 'LIST')
        }}
        isLoading={isPending}
        variant={mode === 'EDIT' || mode === 'ADD' ? 'secondary' : 'primary'}
      >
        {mode === 'EDIT' || mode === 'ADD' ? t('saveNewJobCta') : t('submitCta')}
      </Button>
    </Flex>
  )
}
