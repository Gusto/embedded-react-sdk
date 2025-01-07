import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { FlsaStatus } from '@/shared/constants'

import { useCompensation, type CompensationInputs } from './Compensation'

export const Actions = () => {
  const { isPending, mode, submitWithEffect, handleAdd, handleCancelAddJob, primaryFlsaStatus } =
    useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  const { control } = useFormContext<CompensationInputs>()
  const watchedFlsaStatus = useWatch({ control, name: 'flsa_status' })

  return (
    <Flex justifyContent="flex-end" alignItems="center">
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
        <Button variant="link" onPress={handleCancelAddJob} isDisabled={isPending}>
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
        variant={
          mode === 'EDIT_ADDITIONAL_JOB' || mode === 'ADD_ADDITIONAL_JOB' ? 'secondary' : 'primary'
        }
      >
        {mode === 'EDIT_ADDITIONAL_JOB' || mode === 'ADD_ADDITIONAL_JOB'
          ? t('saveNewJobCta')
          : t('submitCta')}
      </Button>
    </Flex>
  )
}
