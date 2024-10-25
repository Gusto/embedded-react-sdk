import { NumberFormatter } from '@internationalized/number'
import { Label, Input, FieldError, Link, ListBoxItem } from 'react-aria-components'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useTranslation, Trans } from 'react-i18next'
import {
  Button,
  Flex,
  NumberField,
  Select,
  type SelectCategory,
  TextField,
} from '@/components/Common'
import { useLocale } from '@/contexts/LocaleProvider'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { type CompensationInputs, useCompensation } from './Compensation'

export const Edit = () => {
  const { t } = useTranslation('Employee.Compensation')
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
  const { locale, currency } = useLocale()
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
  const formatter = new NumberFormatter(locale, { style: 'currency', currency: currency })
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
        <Controller
          control={control}
          name="flsa_status"
          render={({ field, fieldState: { invalid, error }, formState: { defaultValues } }) => (
            <Select
              {...field}
              isInvalid={invalid}
              label={t('employeeClassification')}
              description={
                <Trans
                  t={t}
                  i18nKey="classificationCTA"
                  components={{ classificationCta: <Link /> }}
                />
              }
              errorMessage={
                error?.type === 'check'
                  ? t('validations.exemptThreshold', {
                      limit: formatter.format(FLSA_OVERTIME_SALARY_LIMIT),
                    })
                  : error?.message
              }
              onChange={(val: string) => {
                handleFlsaChange(val)
                field.onChange(val)
              }}
              items={classificationOptions}
              isRequired
              isDisabled={primaryFlsaStatus === FlsaStatus.NONEXEMPT && !currentJob?.primary}
              validationBehavior="aria"
              defaultSelectedKey={defaultValues?.flsa_status}
            >
              {(classification: SelectCategory) => <ListBoxItem>{classification.name}</ListBoxItem>}
            </Select>
          )}
        />
      )}
      <Controller
        control={control}
        name="rate"
        render={({ field, fieldState: { invalid } }) => (
          <NumberField
            {...field}
            label={t('amount')}
            formatOptions={{
              style: 'currency',
              currency: currency,
              currencyDisplay: 'symbol',
            }}
            validationBehavior="aria"
            minValue={0}
            isInvalid={invalid}
            isDisabled={
              watchFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
              watchFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
            }
          />
        )}
      />
      <Controller
        control={control}
        name="payment_unit"
        render={({ field, fieldState: { invalid }, formState: { defaultValues } }) => (
          <Select
            {...field}
            label={t('paymentUnitLabel')}
            description={t('paymentUnitDescription')}
            items={paymentUnitOptions}
            defaultSelectedKey={defaultValues?.payment_unit}
            selectedKey={field.value}
            isInvalid={invalid}
            isDisabled={
              watchFlsaStatus === FlsaStatus.OWNER ||
              watchFlsaStatus === FlsaStatus.COMISSION_ONLY_NONEXEMPT ||
              watchFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
            }
            validationBehavior="aria"
            errorMessage={t('validations.paymentUnit')}
          >
            {(category: { id: string; name: string }) => (
              <ListBoxItem id={category.id}>{category.name}</ListBoxItem>
            )}
          </Select>
        )}
      />
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
