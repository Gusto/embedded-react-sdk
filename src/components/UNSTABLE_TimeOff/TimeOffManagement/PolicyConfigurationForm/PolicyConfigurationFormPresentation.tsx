import { useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type {
  AccrualMethod,
  AccrualMethodFixed,
  PolicyConfigurationFormData,
  PolicyConfigurationFormPresentationProps,
  ResetDateType,
} from './PolicyConfigurationFormTypes'
import styles from './PolicyConfigurationForm.module.scss'
import {
  Flex,
  ActionsLayout,
  RadioGroupField,
  NumberInputField,
  CheckboxField,
  SelectField,
  TextInputField,
} from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}))

export function PolicyConfigurationFormPresentation({
  onContinue,
  onCancel,
  defaultValues,
}: PolicyConfigurationFormPresentationProps) {
  useI18n('Company.TimeOff.CreateTimeOffPolicy')
  const { t } = useTranslation('Company.TimeOff.CreateTimeOffPolicy')
  const { Heading, Text, Button } = useComponentContext()

  const formMethods = useForm<PolicyConfigurationFormData>({
    defaultValues: {
      name: '',
      resetMonth: 1,
      resetDay: 1,
      ...defaultValues,
    },
  })

  const { control } = formMethods
  const accrualMethod = useWatch({ control, name: 'accrualMethod' })
  const resetDateType = useWatch({ control, name: 'resetDateType' })

  const accrualMethodOptions = useMemo(
    () => [
      {
        value: 'per_hour_paid' as AccrualMethod,
        label: t('policyDetails.perHourPaidLabel'),
        description: t('policyDetails.perHourPaidHint'),
      },
      {
        value: 'per_calendar_year' as AccrualMethod,
        label: t('policyDetails.perYearLabel'),
        description: t('policyDetails.perYearHint'),
      },
      {
        value: 'unlimited' as AccrualMethod,
        label: t('policyDetails.unlimitedLabel'),
        description: t('policyDetails.unlimitedHint'),
      },
    ],
    [t],
  )

  const accrualMethodFixedOptions = useMemo(
    () => [
      {
        value: 'per_pay_period' as AccrualMethodFixed,
        label: t('policyDetails.perPayPeriodLabel'),
        description: t('policyDetails.perPayPeriodHint'),
      },
      {
        value: 'all_at_once' as AccrualMethodFixed,
        label: t('policyDetails.allAtOnceLabel'),
        description: t('policyDetails.allAtOnceHint'),
      },
    ],
    [t],
  )

  const resetDateTypeOptions = useMemo(
    () => [
      {
        value: 'per_anniversary_year' as ResetDateType,
        label: t('policyDetails.perAnniversaryYearLabel'),
      },
      {
        value: 'per_calendar_year' as ResetDateType,
        label: t('policyDetails.perCalendarYearLabel'),
      },
    ],
    [t],
  )

  const handleSubmit = (data: PolicyConfigurationFormData) => {
    onContinue(data)
  }

  const isHourlyMethod = accrualMethod === 'per_hour_paid'
  const isFixedMethod = accrualMethod === 'per_calendar_year'
  const showResetDate = isHourlyMethod || isFixedMethod
  const showCustomDateFields = resetDateType === 'per_calendar_year'

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <Flex flexDirection="column" gap={32}>
          <Heading as="h2">{t('policyDetails.title')}</Heading>

          <Flex flexDirection="column" gap={20}>
            <TextInputField name="name" label={t('policyDetails.policyNameLabel')} isRequired />

            <RadioGroupField<AccrualMethod>
              name="accrualMethod"
              label={t('policyDetails.accrualMethodLabel')}
              description={t('policyDetails.accrualMethodHint')}
              options={accrualMethodOptions}
              isRequired
            />

            {isHourlyMethod && (
              <>
                <hr className={styles.divider} />

                <NumberInputField
                  className={styles.narrowInput}
                  name="accrualRate"
                  label={t('policyDetails.employeesWillAccrueLabel')}
                  adornmentEnd={t('policyDetails.hoursUnit')}
                  isRequired
                  min={0}
                />

                <NumberInputField
                  className={styles.narrowInput}
                  name="accrualRateUnit"
                  label={t('policyDetails.forEveryLabel')}
                  adornmentEnd={t('policyDetails.hoursWorkedUnit')}
                  isRequired
                  min={1}
                />

                <Flex flexDirection="column" gap={8}>
                  <Text>{t('policyDetails.additionalOptionsLabel')}</Text>
                  <CheckboxField
                    name="includeOvertime"
                    label={t('policyDetails.includeOvertimeLabel')}
                  />
                  <CheckboxField name="allPaidHours" label={t('policyDetails.allPaidHoursLabel')} />
                </Flex>
              </>
            )}

            {isFixedMethod && (
              <>
                <hr className={styles.divider} />

                <NumberInputField
                  className={styles.narrowInput}
                  name="accrualRate"
                  label={t('policyDetails.fixedAccrualRateLabel')}
                  description={t('policyDetails.fixedAccrualRateHint')}
                  adornmentEnd={t('policyDetails.hoursUnit')}
                  isRequired
                  min={0}
                />

                <RadioGroupField<AccrualMethodFixed>
                  name="accrualMethodFixed"
                  label={t('policyDetails.accrualMethodFixed')}
                  description={t('policyDetails.accrualMethodFixedHint')}
                  options={accrualMethodFixedOptions}
                  isRequired
                />
              </>
            )}

            {showResetDate && (
              <>
                <hr className={styles.divider} />

                <RadioGroupField<ResetDateType>
                  name="resetDateType"
                  label={t('policyDetails.policyResetDateType')}
                  description={t('policyDetails.policyResetDateTypeHint')}
                  options={resetDateTypeOptions}
                  isRequired
                />

                {showCustomDateFields && (
                  <Flex gap={8}>
                    <SelectField<number>
                      className={styles.dateSelect}
                      name="resetMonth"
                      label={t('policyDetails.monthLabel')}
                      options={MONTH_OPTIONS}
                    />
                    <SelectField<number>
                      className={styles.dateSelect}
                      name="resetDay"
                      label={t('policyDetails.dayLabel')}
                      options={DAY_OPTIONS}
                    />
                  </Flex>
                )}
              </>
            )}

            <ActionsLayout>
              <Button variant="secondary" onClick={onCancel}>
                {t('cancelCta')}
              </Button>
              <Button variant="primary" type="submit">
                {t('continueCta')}
              </Button>
            </ActionsLayout>
          </Flex>
        </Flex>
      </HtmlForm>
    </FormProvider>
  )
}
