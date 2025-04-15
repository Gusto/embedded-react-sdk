import { useEffect } from 'react'
import { Link } from 'react-aria-components'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { type CompensationInputs, useCompensation } from './useCompensation'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus, PAY_PERIODS } from '@/shared/constants'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import { NumberInputField, SelectField, TextInputField, Switch } from '@/components/Common'

export interface SelectCategory {
  id: string
  name: string
}

export const Edit = () => {
  const { t } = useTranslation('Employee.Compensation')
  const format = useNumberFormatter('currency')
  const {
    control,
    register,
    setValue,
    formState: { defaultValues },
  } = useFormContext<CompensationInputs>()
  const watchedFlsaStatus = useWatch({ control, name: 'flsaStatus' })
  const { currentJob, mode, minimumWages, handleFlsaChange } = useCompensation()

  /**Correctly set payment unit selected option and rate based on flsa status, falling back to default */
  useEffect(() => {
    if (watchedFlsaStatus === FlsaStatus.OWNER) {
      setValue('paymentUnit', 'Paycheck')
    } else if (
      watchedFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('paymentUnit', 'Year')
      setValue('rate', 0)
    } else if (defaultValues?.paymentUnit) {
      setValue('paymentUnit', defaultValues.paymentUnit)
    }
  }, [watchedFlsaStatus, setValue, defaultValues?.paymentUnit])

  if (
    !(
      mode === 'ADD_INITIAL_JOB' ||
      mode === 'ADD_ADDITIONAL_JOB' ||
      mode === 'EDIT_INITIAL_JOB' ||
      mode === 'EDIT_ADDITIONAL_JOB'
    )
  )
    return

  const classificationOptions = (Object.keys(FlsaStatus) as Array<keyof typeof FlsaStatus>).map(
    key => ({
      value: FlsaStatus[key],
      label: t(`flsaStatusLabels.${FlsaStatus[key]}`),
    }),
  )

  const paymentUnitOptions = [
    { value: PAY_PERIODS.HOUR, label: t('paymentUnitOptions.Hour') },
    { value: PAY_PERIODS.WEEK, label: t('paymentUnitOptions.Week') },
    { value: PAY_PERIODS.MONTH, label: t('paymentUnitOptions.Month') },
    { value: PAY_PERIODS.YEAR, label: t('paymentUnitOptions.Year') },
    { value: PAY_PERIODS.PAYCHECK, label: t('paymentUnitOptions.Paycheck') },
  ]

  const isFlsaSelectionEnabled =
    watchedFlsaStatus !== FlsaStatus.NONEXEMPT || currentJob?.primary || mode === 'ADD_INITIAL_JOB'

  const isAdjustMinimumWageEnabled =
    watchedFlsaStatus === FlsaStatus.NONEXEMPT && minimumWages.length > 0

  return (
    <>
      <TextInputField
        name="jobTitle"
        label={t('jobTitle')}
        isRequired
        errorMessage={t('validations.title')}
      />
      {/* hiding flsa selection for secondary jobs */}
      {!isFlsaSelectionEnabled && <input type="hidden" {...register('flsaStatus')} />}
      {isFlsaSelectionEnabled && (
        <SelectField
          name="flsaStatus"
          label={t('employeeClassification')}
          description={
            <Trans t={t} i18nKey="classificationCTA" components={{ classificationCta: <Link /> }} />
          }
          errorMessage={t('validations.exemptThreshold', {
            limit: format(FLSA_OVERTIME_SALARY_LIMIT),
          })}
          options={classificationOptions}
          isRequired
          isDisabled={!isFlsaSelectionEnabled}
          onChange={handleFlsaChange}
        />
      )}
      <NumberInputField
        name="rate"
        label={t('amount')}
        format="currency"
        currencyDisplay="symbol"
        min={0}
        errorMessage={t('validations.rate')}
        isDisabled={
          watchedFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
          watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
        }
      />
      {isAdjustMinimumWageEnabled && (
        <>
          <Switch
            control={control}
            name="adjustForMinimumWage"
            label={t('adjustForMinimumWage')}
            description={t('adjustForMinimumWageDescription')}
          />
          <SelectField
            name="minimumWageId"
            label={t('minimumWageLabel')}
            description={t('minimumWageDescription')}
            options={minimumWages.map(wage => ({
              value: wage.uuid,
              label: `${format(Number(wage.wage))} - ${wage.authority}: ${wage.notes ?? ''}`,
            }))}
            errorMessage={t('validations.minimumWage')}
          />
        </>
      )}
      <SelectField
        name="paymentUnit"
        label={t('paymentUnitLabel')}
        description={t('paymentUnitDescription')}
        options={paymentUnitOptions}
        errorMessage={t('validations.paymentUnit')}
        isDisabled={
          watchedFlsaStatus === FlsaStatus.OWNER ||
          watchedFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
          watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
        }
      />
    </>
  )
}
