import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCompensation, type CompensationInputs } from './useCompensation'
import { ActionsLayout } from '@/components/Common'
import { FlsaStatus } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export const Actions = () => {
  const { isPending, mode, submitWithEffect, handleAdd, handleCancelAddJob, primaryFlsaStatus } =
    useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  const { control } = useFormContext<CompensationInputs>()
  const watchedFlsaStatus = useWatch({ control, name: 'flsaStatus' })
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      {primaryFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'LIST' && (
        <Components.Button
          variant="secondary"
          onClick={() => {
            handleAdd()
          }}
          isDisabled={isPending}
        >
          {t('addAnotherJobCta')}
        </Components.Button>
      )}
      {((primaryFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'ADD_ADDITIONAL_JOB') ||
        mode === 'EDIT_ADDITIONAL_JOB') && (
        <Components.Button variant="secondary" onClick={handleCancelAddJob} isDisabled={isPending}>
          {t('cancelNewJobCta')}
        </Components.Button>
      )}
      <Components.Button
        onClick={() => {
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
      >
        {mode === 'EDIT_ADDITIONAL_JOB' || mode === 'ADD_ADDITIONAL_JOB'
          ? t('saveNewJobCta')
          : t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
