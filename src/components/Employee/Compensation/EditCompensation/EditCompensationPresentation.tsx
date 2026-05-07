import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CompensationSchema,
  type CompensationInputs,
  type CompensationOutputs,
  rateExemptThresholdError,
  rateMinimumError,
} from '../compensationSchema'
import {
  ActionsLayout,
  CheckboxField,
  ComboBoxField,
  Flex,
  NumberInputField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextInputField,
} from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import {
  FLSA_OVERTIME_SALARY_LIMIT,
  FlsaStatus,
  PAY_PERIODS,
  TIP_CREDITS_UNSUPPORTED_STATES,
} from '@/shared/constants'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { WA_RISK_CLASS_CODES } from '@/models/WA_RISK_CODES'

export interface EditCompensationPresentationProps {
  defaultValues: CompensationInputs
  title: string
  submitCtaLabel: string
  canChangeFlsaClassification: boolean
  currentCompensationFlsaStatus: string | undefined
  otherJobsCount: number
  state: string | undefined
  minimumWages: MinimumWage[]
  showTwoPercentStakeholder: boolean
  isPending: boolean
  onSave: (data: CompensationOutputs) => void | Promise<void>
  onCancel?: () => void
}

export function EditCompensationPresentation({
  defaultValues,
  title,
  submitCtaLabel,
  canChangeFlsaClassification,
  currentCompensationFlsaStatus,
  otherJobsCount,
  state,
  minimumWages,
  showTwoPercentStakeholder,
  isPending,
  onSave,
  onCancel,
}: EditCompensationPresentationProps) {
  useI18n('Employee.Compensation')
  const { t } = useTranslation('Employee.Compensation')
  const format = useNumberFormatter('currency')
  const Components = useComponentContext()

  const formMethods = useForm<CompensationInputs, unknown, CompensationOutputs>({
    resolver: zodResolver(CompensationSchema),
    defaultValues,
  })

  const {
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = formMethods

  const watchedFlsaStatus = useWatch({ control, name: 'flsaStatus' })
  const watchedStateWcCovered = useWatch({ control, name: 'stateWcCovered' })
  const isAdjustingMinimumWage = useWatch({ control, name: 'adjustForMinimumWage' })

  const [showFlsaChangeWarning, setShowFlsaChangeWarning] = useState(false)

  useEffect(() => {
    if (watchedFlsaStatus === FlsaStatus.OWNER) {
      setValue('paymentUnit', 'Paycheck')
    } else if (
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
      watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('paymentUnit', 'Year')
      setValue('rate', 0)
    } else {
      setValue('paymentUnit', defaultValues.paymentUnit)
    }
  }, [watchedFlsaStatus, setValue, defaultValues.paymentUnit])

  const handleFlsaChange = (value: string | number) => {
    if (currentCompensationFlsaStatus === FlsaStatus.NONEXEMPT && otherJobsCount > 0) {
      setShowFlsaChangeWarning(true)
    }
    if (value === FlsaStatus.OWNER) {
      setValue('paymentUnit', 'Paycheck')
    } else if (
      value === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
      value === FlsaStatus.COMMISSION_ONLY_EXEMPT
    ) {
      setValue('paymentUnit', 'Year')
      setValue('rate', 0)
    }
  }

  const stateWcRiskOptions = useMemo(
    () =>
      WA_RISK_CLASS_CODES.map(({ code, description }) => ({
        value: code,
        label: `${code}: ${description}`,
      })),
    [],
  )

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
    watchedFlsaStatus !== FlsaStatus.NONEXEMPT || canChangeFlsaClassification

  const isAdjustMinimumWageEnabled =
    watchedFlsaStatus === FlsaStatus.NONEXEMPT &&
    minimumWages.length > 0 &&
    state !== undefined &&
    !TIP_CREDITS_UNSUPPORTED_STATES.includes(state)

  let rateErrorMessage = t('validations.rate')
  if (errors.rate?.message === rateMinimumError) {
    rateErrorMessage = t('validations.nonZeroRate')
  } else if (errors.rate?.message === rateExemptThresholdError) {
    rateErrorMessage = t('validations.rateExemptThreshold', {
      limit: format(FLSA_OVERTIME_SALARY_LIMIT),
    })
  }

  const showCancel = Boolean(onCancel)

  return (
    <FormProvider {...formMethods}>
      <Form>
        <Flex flexDirection="column" gap={32}>
          <Components.Heading as="h2">{title}</Components.Heading>
          {showFlsaChangeWarning && (
            <Components.Alert
              label={t('validations.classificationChangeNotification')}
              status="warning"
            />
          )}
          <TextInputField
            name="jobTitle"
            label={t('jobTitle')}
            isRequired
            errorMessage={t('validations.title')}
          />
          {isFlsaSelectionEnabled && (
            <SelectField
              name="flsaStatus"
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
            min={0}
            errorMessage={rateErrorMessage}
            isRequired
            isDisabled={
              watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
              watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
            }
          />
          <SelectField
            name="paymentUnit"
            label={t('paymentUnitLabel')}
            description={t('paymentUnitDescription')}
            options={paymentUnitOptions}
            errorMessage={t('validations.paymentUnit')}
            isRequired
            isDisabled={
              watchedFlsaStatus === FlsaStatus.OWNER ||
              watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
              watchedFlsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
            }
          />
          {isAdjustMinimumWageEnabled && (
            <>
              <SwitchField
                name="adjustForMinimumWage"
                label={t('adjustForMinimumWage')}
                description={t('adjustForMinimumWageDescription')}
              />
              {isAdjustingMinimumWage && (
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
              )}
            </>
          )}
          {showTwoPercentStakeholder && (
            <CheckboxField label={t('twoPercentStakeholderLabel')} name="twoPercentShareholder" />
          )}
          {state === 'WA' && (
            <>
              <RadioGroupField
                name="stateWcCovered"
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
                  name="stateWcClassCode"
                  label={t('stateWcClassCodeLabel')}
                  options={stateWcRiskOptions}
                  errorMessage={t('validations.stateWcClassCode')}
                  placeholder={t('stateWcClassCodeLabel')}
                  description={t('stateWcClassCodeDescription')}
                />
              )}
            </>
          )}
          <ActionsLayout>
            {showCancel && onCancel && (
              <Components.Button variant="secondary" onClick={onCancel} isDisabled={isPending}>
                {t('cancelNewJobCta')}
              </Components.Button>
            )}
            <Components.Button
              onClick={() => {
                void handleSubmit(onSave)()
              }}
              isLoading={isPending}
            >
              {submitCtaLabel}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
