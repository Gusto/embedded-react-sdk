import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import type { CompensationFormReady } from './useCompensationForm'
import type { FlsaDerivedValues } from './schema'
import {
  NumberInputField,
  SelectField,
  TextInputField,
  SwitchField,
  RadioGroupField,
  ComboBoxField,
  CheckboxField,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FLSA_OVERTIME_SALARY_LIMIT } from '@/shared/constants'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useI18n } from '@/i18n'

const I18N_NS = 'Employee.CompensationFields' as const

export type CompensationFieldsMetadata = CompensationFormReady['fields']

interface CompensationFieldsProps {
  fields: CompensationFieldsMetadata
  onFlsaStatusChange: (flsaStatus: string) => FlsaDerivedValues
}

export function CompensationFields({ fields, onFlsaStatusChange }: CompensationFieldsProps) {
  useI18n(I18N_NS)
  const { t } = useTranslation(I18N_NS)
  const format = useNumberFormatter('currency')
  const Components = useComponentContext()
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext()

  const watchedFlsaStatus = useWatch({ control, name: 'flsaStatus' })
  const watchedStateWcCovered = useWatch({ control, name: 'stateWcCovered' })

  useEffect(() => {
    if (!watchedFlsaStatus) return
    const valuesToSet = onFlsaStatusChange(watchedFlsaStatus)
    for (const [key, value] of Object.entries(valuesToSet)) {
      setValue(key, value)
    }
  }, [watchedFlsaStatus, onFlsaStatusChange, setValue])

  const validationMessages: Record<string, string> = {
    REQUIRED: t('validations.REQUIRED'),
    RATE_MINIMUM: t('validations.RATE_MINIMUM'),
    RATE_EXEMPT_THRESHOLD: t('validations.RATE_EXEMPT_THRESHOLD', {
      limit: format(FLSA_OVERTIME_SALARY_LIMIT),
    }),
    MINIMUM_WAGE_REQUIRED: t('validations.MINIMUM_WAGE_REQUIRED'),
    STATE_WC_CLASS_CODE_REQUIRED: t('validations.STATE_WC_CLASS_CODE_REQUIRED'),
    INVALID_PAYMENT_UNIT_FOR_FLSA: t('validations.INVALID_PAYMENT_UNIT_FOR_FLSA'),
  }
  const v = (message: unknown) =>
    typeof message === 'string' ? validationMessages[message] : undefined

  const classificationOptions = fields.flsaStatus.options.map(value => ({
    value,
    label: t(`flsaStatusLabels.${value}`),
  }))

  const paymentUnitOptions = fields.paymentUnit.options.map(value => ({
    value,
    label: t(`paymentUnitOptions.${value}`),
  }))

  return (
    <>
      <TextInputField
        name={fields.jobTitle.name}
        label={t('jobTitle')}
        isRequired={fields.jobTitle.isRequired}
        errorMessage={v(errors.jobTitle?.message)}
      />
      {fields.flsaStatus.isDisabled && <input type="hidden" {...register('flsaStatus')} />}
      {!fields.flsaStatus.isDisabled && (
        <SelectField
          name={fields.flsaStatus.name}
          label={t('employeeClassification')}
          description={
            <Trans
              t={t}
              i18nKey="classificationLink"
              components={{
                ClassificationLink: <Components.Link />,
              }}
            />
          }
          errorMessage={v(errors.flsaStatus?.message)}
          options={classificationOptions}
          isRequired={fields.flsaStatus.isRequired}
        />
      )}
      <NumberInputField
        name={fields.rate.name}
        label={t('amount')}
        format="currency"
        min={0}
        errorMessage={v(errors.rate?.message)}
        isRequired
        isDisabled={fields.rate.isDisabled}
      />
      {!fields.adjustForMinimumWage.isDisabled && (
        <>
          <SwitchField
            name={fields.adjustForMinimumWage.name}
            label={t('adjustForMinimumWage')}
            description={t('adjustForMinimumWageDescription')}
          />
          <SelectField
            name={fields.minimumWageId.name}
            label={t('minimumWageLabel')}
            description={t('minimumWageDescription')}
            options={fields.minimumWageId.options}
            errorMessage={v(errors.minimumWageId?.message)}
          />
        </>
      )}
      <SelectField
        name={fields.paymentUnit.name}
        label={t('paymentUnitLabel')}
        description={t('paymentUnitDescription')}
        options={paymentUnitOptions}
        errorMessage={v(errors.paymentUnit?.message)}
        isRequired={fields.paymentUnit.isRequired}
        isDisabled={fields.paymentUnit.isDisabled}
      />
      {!fields.twoPercentShareholder.isDisabled && (
        <CheckboxField
          label={t('twoPercentStakeholderLabel')}
          name={fields.twoPercentShareholder.name}
        />
      )}
      {!fields.stateWcCovered.isDisabled && (
        <>
          <RadioGroupField
            name={fields.stateWcCovered.name}
            label={t('stateWcCoveredLabel')}
            description={
              <Trans
                t={t}
                i18nKey="stateWcCoveredDescription"
                components={{
                  wcLink: (
                    <Components.Link
                      href="https://www.lni.wa.gov/insurance/rates-risk-classes/risk-classes-for-workers-compensation/risk-class-lookup#/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            }
            options={[
              { label: t('stateWcCoveredOptions.yes'), value: true },
              { label: t('stateWcCoveredOptions.no'), value: false },
            ]}
          />
          {watchedStateWcCovered && (
            <ComboBoxField
              name={fields.stateWcClassCode.name}
              label={t('stateWcClassCodeLabel')}
              options={fields.stateWcClassCode.options}
              errorMessage={v(errors.stateWcClassCode?.message)}
              placeholder={t('stateWcClassCodeLabel')}
              description={t('stateWcClassCodeDescription')}
            />
          )}
        </>
      )}
    </>
  )
}
