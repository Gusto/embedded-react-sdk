import {
  Button,
  Flex,
  NumberField,
  Select,
  type SelectCategory,
  TextField,
} from '@/components/Common'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { NumberFormatter } from '@internationalized/number'
import { Link, ListBoxItem } from 'react-aria-components'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { type CompensationInputs } from './Compensation'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import { useCompensation } from './useCompensation'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

export const Edit = () => {
  const { t } = useTranslation('Employee.Compensation')
  const format = useNumberFormatter('currency')
  const { control, register } = useFormContext<CompensationInputs>()
  const watchFlsaStatus = useWatch({ control, name: 'flsa_status' })
  const {
    currentJob,
    primaryFlsaStatus,
    isPending,
    mode,
    handleFlsaChange,
    submitWithEffect,
    handleCancelAddJob,
  } = useCompensation()
  const { currency } = useLocale()
  if (mode === 'LIST') return

  const classificationOptions = Object.keys(FlsaStatus).map((key: keyof typeof FlsaStatus) => ({
    id: FlsaStatus[key],
    name: t(`flsaStatusLabels.${FlsaStatus[key]}`),
  }))

  const paymentUnitOptions = [
    { id: 'Hour', name: t('paymentUnitOptions.Hour') },
    { id: 'Week', name: t('paymentUnitOptions.Week') },
    { id: 'Month', name: t('paymentUnitOptions.Month') },
    { id: 'Year', name: t('paymentUnitOptions.Year') },
    { id: 'Paycheck', name: t('paymentUnitOptions.Paycheck') },
  ]
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
      {primaryFlsaStatus === FlsaStatus.NONEXEMPT && !currentJob?.primary && (
        <input type="hidden" {...register('flsa_status')} />
      )}
      {(primaryFlsaStatus !== FlsaStatus.NONEXEMPT || currentJob?.primary) && (
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
          isDisabled={primaryFlsaStatus === FlsaStatus.NONEXEMPT && !currentJob?.primary}
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
        validationBehavior="aria"
        minValue={0}
        isDisabled={
          watchFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
          watchFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
        }
      />
      <Select
        control={control}
        name="payment_unit"
        label={t('paymentUnitLabel')}
        description={t('paymentUnitDescription')}
        items={paymentUnitOptions}
        errorMessage={t('validations.paymentUnit')}
        isDisabled={
          watchFlsaStatus === FlsaStatus.OWNER ||
          watchFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
          watchFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
        }
        validationBehavior="aria"
      >
        {(category: { id: string; name: string }) => (
          <ListBoxItem id={category.id}>{category.name}</ListBoxItem>
        )}
      </Select>
      {watchFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'SINGLE' && (
        <Button
          variant="link"
          onPress={() => {
            submitWithEffect('ADD')
          }}
          isDisabled={isPending}
        >
          {t('addAnotherJobCta')}
        </Button>
      )}
      {primaryFlsaStatus === FlsaStatus.NONEXEMPT && (mode === 'EDIT' || mode === 'ADD') && (
        <Flex justifyContent="flex-end">
          <Button variant="link" onPress={handleCancelAddJob} isDisabled={isPending}>
            {t('cancelNewJobCta')}
          </Button>
          <Button
            variant="link"
            onPress={() => {
              submitWithEffect('LIST')
            }}
            isDisabled={isPending}
          >
            {t('saveNewJobCta')}
          </Button>
        </Flex>
      )}
    </>
  )
}
