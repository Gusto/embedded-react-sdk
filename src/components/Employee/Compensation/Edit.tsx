import { useEffect } from 'react'
import { Link, ListBoxItem } from 'react-aria-components'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { type CompensationInputs, useCompensation } from './Compensation'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus, PAY_PERIODS } from '@/shared/constants'
import { useLocale } from '@/contexts/LocaleProvider'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import { NumberField, Select, type SelectCategory, TextField, Switch } from '@/components/Common'
import { Schemas } from '@/types/schema'

export const Edit = () => {
  const { t } = useTranslation('Employee.Compensation')
  const format = useNumberFormatter('currency')
  const {
    control,
    register,
    setValue,
    formState: { defaultValues },
  } = useFormContext<CompensationInputs>()
  const watchedFlsaStatus = useWatch({ control, name: 'flsa_status' })
  const { currentJob, mode, minimumWages, handleFlsaChange } = useCompensation()
  const { currency } = useLocale()

  /**Correctly set payment unit selected option and rate based on flsa status, falling back to default */
  useEffect(() => {
    if (watchedFlsaStatus === FlsaStatus.OWNER) {
      setValue('payment_unit', 'Paycheck')
    } else if (
      watchedFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('payment_unit', 'Year')
      setValue('rate', 0)
    } else if (defaultValues?.payment_unit) {
      setValue('payment_unit', defaultValues.payment_unit)
    }
  }, [watchedFlsaStatus, setValue, defaultValues?.payment_unit])

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
        name="job_title"
        label={t('jobTitle')}
        isRequired
        errorMessage={t('validations.title')}
      />
      {/* hiding flsa selection for secondary jobs */}
      {!isFlsaSelectionEnabled && <input type="hidden" {...register('flsa_status')} />}
      {isFlsaSelectionEnabled && (
        <Select
          control={control}
          name="flsa_status"
          label={t('employeeClassification')}
          description={
            <Trans t={t} i18nKey="classificationCTA" components={{ classificationCta: <Link /> }} />
          }
          errorMessage={t('validations.exemptThreshold', {
            limit: format(FLSA_OVERTIME_SALARY_LIMIT),
          })}
          items={classificationOptions}
          isRequired
          isDisabled={!isFlsaSelectionEnabled}
          validationBehavior="aria"
          onSelectionChange={handleFlsaChange}
        >
          {(classification: SelectCategory) => <ListBoxItem>{classification.name}</ListBoxItem>}
        </Select>
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
            name="adjust_for_minimum_wage"
            label={t('adjustForMinimumWage')}
            description={t('adjustForMinimumWageDescription')}
          />
          <Select
            control={control}
            name="minimumWageId"
            label={t('minimumWageLabel')}
            description={t('minimumWageDescription')}
            items={minimumWages}
            errorMessage={t('validations.minimumWage')}
          >
            {(wage: Schemas['Minimum-Wage']) => (
              <ListBoxItem id={wage.uuid} key={wage.uuid} value={wage}>
                {format(Number(wage.wage))} - {wage.authority}: {wage.notes ?? ''}
              </ListBoxItem>
            )}
          </Select>
        </>
      )}
      <Select
        control={control}
        name="payment_unit"
        label={t('paymentUnitLabel')}
        description={t('paymentUnitDescription')}
        items={paymentUnitOptions}
        errorMessage={t('validations.paymentUnit')}
        isDisabled={
          watchedFlsaStatus === FlsaStatus.OWNER ||
          watchedFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
          watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
        }
      >
        {(category: SelectCategory) => <ListBoxItem id={category.id}>{category.name}</ListBoxItem>}
      </Select>
    </>
  )
}
