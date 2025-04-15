import { useEffect } from 'react'
import { Link } from 'react-aria-components'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { type CompensationInputs, useCompensation } from './useCompensation'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus, PAY_PERIODS } from '@/shared/constants'
import { useLocale } from '@/contexts/LocaleProvider'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import { NumberField, SelectField, TextField, Switch } from '@/components/Common'

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
  const { currency } = useLocale()

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
      id: FlsaStatus[key],
      name: t(`flsaStatusLabels.${FlsaStatus[key]}`),
    }),
  )

  const paymentUnitOptions = [
    { id: PAY_PERIODS.HOUR, name: t('paymentUnitOptions.Hour') },
    { id: PAY_PERIODS.WEEK, name: t('paymentUnitOptions.Week') },
    { id: PAY_PERIODS.MONTH, name: t('paymentUnitOptions.Month') },
    { id: PAY_PERIODS.YEAR, name: t('paymentUnitOptions.Year') },
    { id: PAY_PERIODS.PAYCHECK, name: t('paymentUnitOptions.Paycheck') },
  ]

  const isFlsaSelectionEnabled =
    watchedFlsaStatus !== FlsaStatus.NONEXEMPT || currentJob?.primary || mode === 'ADD_INITIAL_JOB'

  const isAdjustMinimumWageEnabled =
    watchedFlsaStatus === FlsaStatus.NONEXEMPT && minimumWages.length > 0

  return (
    <>
      <TextField
        control={control}
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
          options={classificationOptions.map(o => ({ value: o.id, label: o.name }))}
          isRequired
          isDisabled={!isFlsaSelectionEnabled}
          onChange={handleFlsaChange}
        />
      )}
      <NumberField
        control={control}
        name="rate"
        label={t('amount')}
        formatOptions={{
          style: 'currency',
          currency: currency,
          currencyDisplay: 'symbol',
        }}
        minValue={0}
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
        options={paymentUnitOptions.map(o => ({ value: o.id, label: o.name }))}
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
