import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCompensation, type CompensationInputs } from './Compensation'
import { Button, ActionsLayout } from '@/components/Common'
import { FlsaStatus } from '@/shared/constants'

export const Actions = () => {
  const { isPending, mode, submitWithEffect, handleAdd, handleCancelAddJob, primaryFlsaStatus } =
    useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  const { control } = useFormContext<CompensationInputs>()
  const watchedFlsaStatus = useWatch({ control, name: 'flsaStatus' })

  return (
    <ActionsLayout>
      {primaryFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'LIST' && (
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
      {((primaryFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'ADD_ADDITIONAL_JOB') ||
        mode === 'EDIT_ADDITIONAL_JOB') && (
        <Button variant="secondary" onPress={handleCancelAddJob} isDisabled={isPending}>
          {t('cancelNewJobCta')}
        </Button>
      )}
      <Button
        onPress={() => {
          if (mode === 'LIST') {
            submitWithEffect('PROCEED')
          }

          if (mode === 'ADD_ADDITIONAL_JOB' || mode === 'EDIT_ADDITIONAL_JOB') {
            submitWithEffect('LIST')
          }

          if (mode === 'ADD_INITIAL_JOB' || mode === 'EDIT_INITIAL_JOB') {
            if (watchedFlsaStatus === FlsaStatus.NONEXEMPT) {
              submitWithEffect('LIST')
            } else {
              submitWithEffect('PROCEED')
            }
          }
        }}
        isLoading={isPending}
        variant="primary"
      >
        {mode === 'EDIT_ADDITIONAL_JOB' || mode === 'ADD_ADDITIONAL_JOB'
          ? t('saveNewJobCta')
          : t('submitCta')}
      </Button>
    </ActionsLayout>
  )
}
