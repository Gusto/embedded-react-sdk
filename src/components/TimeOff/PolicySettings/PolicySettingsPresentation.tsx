import { useId } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { PolicySettingsFormData, PolicySettingsPresentationProps } from './PolicySettingsTypes'
import styles from './PolicySettings.module.scss'
import { Flex, ActionsLayout, NumberInputField, SwitchField } from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export function PolicySettingsPresentation({
  accrualMethod,
  onContinue,
  onBack,
  defaultValues,
  mode,
  editingPolicyName,
  isPending = false,
}: PolicySettingsPresentationProps) {
  useI18n('Company.TimeOff.CreateTimeOffPolicy')
  const { t } = useTranslation('Company.TimeOff.CreateTimeOffPolicy')
  const { Heading, Button } = useComponentContext()
  const headingId = useId()

  const accrualMaxInputId = useId()
  const balanceMaxInputId = useId()
  const carryOverInputId = useId()
  const waitingPeriodInputId = useId()

  const formMethods = useForm<PolicySettingsFormData>({
    defaultValues: {
      accrualMaximumEnabled: false,
      balanceMaximumEnabled: false,
      carryOverLimitEnabled: false,
      waitingPeriodEnabled: false,
      paidOutOnTermination: false,
      ...defaultValues,
    },
  })

  const { control } = formMethods
  const accrualMaximumEnabled = useWatch({ control, name: 'accrualMaximumEnabled' })
  const balanceMaximumEnabled = useWatch({ control, name: 'balanceMaximumEnabled' })
  const carryOverLimitEnabled = useWatch({ control, name: 'carryOverLimitEnabled' })
  const waitingPeriodEnabled = useWatch({ control, name: 'waitingPeriodEnabled' })

  const isHoursWorked = accrualMethod === 'hours_worked'
  const isFixedPerPayPeriod = accrualMethod === 'fixed_per_pay_period'
  const showAccrualMaximum = isHoursWorked || isFixedPerPayPeriod
  const showWaitingPeriod = isHoursWorked || isFixedPerPayPeriod

  const handleSubmit = (data: PolicySettingsFormData) => {
    onContinue(data)
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm aria-labelledby={headingId} onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <div className={styles.policySettings}>
          <Flex flexDirection="column" gap={32}>
            <Heading as="h2" id={headingId}>
              {mode === 'edit' && editingPolicyName
                ? t('policySettings.editTitle', { name: editingPolicyName })
                : t('policySettings.createTitle')}
            </Heading>

            <Flex flexDirection="column" gap={20}>
              {showAccrualMaximum && (
                <>
                  <div className={styles.settingRow}>
                    <NumberInputField
                      className={styles.settingField}
                      id={accrualMaxInputId}
                      name="accrualMaximum"
                      label={t('policySettings.accrualMaximumLabel')}
                      description={t('policySettings.accrualMaximumHint')}
                      adornmentEnd={t('policySettings.hoursUnit')}
                      placeholder={t('policySettings.numberOfHoursPlaceholder')}
                      isDisabled={!accrualMaximumEnabled}
                      min={0}
                      max={20000}
                    />
                    <div className={styles.toggleCell}>
                      <SwitchField
                        name="accrualMaximumEnabled"
                        label={t('policySettings.accrualMaximumLabel')}
                        shouldVisuallyHideLabel
                        aria-controls={accrualMaxInputId}
                      />
                    </div>
                  </div>

                  <hr className={styles.divider} />
                </>
              )}

              <div className={styles.settingRow}>
                <NumberInputField
                  className={styles.settingField}
                  id={balanceMaxInputId}
                  name="balanceMaximum"
                  label={t('policySettings.balanceMaximumLabel')}
                  description={t('policySettings.balanceMaximumHint')}
                  adornmentEnd={t('policySettings.hoursUnit')}
                  placeholder={t('policySettings.numberOfHoursPlaceholder')}
                  isDisabled={!balanceMaximumEnabled}
                  min={0}
                  max={20000}
                />
                <div className={styles.toggleCell}>
                  <SwitchField
                    name="balanceMaximumEnabled"
                    label={t('policySettings.balanceMaximumLabel')}
                    shouldVisuallyHideLabel
                    aria-controls={balanceMaxInputId}
                  />
                </div>
              </div>

              <hr className={styles.divider} />

              <div className={styles.settingRow}>
                <NumberInputField
                  className={styles.settingField}
                  id={carryOverInputId}
                  name="carryOverLimit"
                  label={t('policySettings.carryOverLimitLabel')}
                  description={t('policySettings.carryOverLimitHint')}
                  adornmentEnd={t('policySettings.hoursUnit')}
                  placeholder={t('policySettings.numberOfHoursPlaceholder')}
                  isDisabled={!carryOverLimitEnabled}
                  min={0}
                  max={20000}
                />
                <div className={styles.toggleCell}>
                  <SwitchField
                    name="carryOverLimitEnabled"
                    label={t('policySettings.carryOverLimitLabel')}
                    shouldVisuallyHideLabel
                    aria-controls={carryOverInputId}
                  />
                </div>
              </div>

              <hr className={styles.divider} />

              {showWaitingPeriod && (
                <>
                  <div className={styles.settingRow}>
                    <NumberInputField
                      className={styles.settingField}
                      id={waitingPeriodInputId}
                      name="waitingPeriod"
                      label={t('policySettings.waitingPeriodLabel')}
                      description={t('policySettings.waitingPeriodHint')}
                      adornmentEnd={t('policySettings.daysUnit')}
                      placeholder={t('policySettings.numberOfDaysPlaceholder')}
                      isDisabled={!waitingPeriodEnabled}
                      min={0}
                      max={20000}
                    />
                    <div className={styles.toggleCell}>
                      <SwitchField
                        name="waitingPeriodEnabled"
                        label={t('policySettings.waitingPeriodLabel')}
                        shouldVisuallyHideLabel
                        aria-controls={waitingPeriodInputId}
                      />
                    </div>
                  </div>

                  <hr className={styles.divider} />
                </>
              )}

              <SwitchField
                name="paidOutOnTermination"
                label={t('policySettings.paidOutOnTerminationLabel')}
                description={t('policySettings.paidOutOnTerminationHint')}
              />

              <hr className={styles.divider} />

              <ActionsLayout>
                <Button variant="secondary" onClick={onBack} isDisabled={isPending}>
                  {t('backCta')}
                </Button>
                <Button variant="primary" type="submit" isLoading={isPending}>
                  {t('policySettings.continueCta')}
                </Button>
              </ActionsLayout>
            </Flex>
          </Flex>
        </div>
      </HtmlForm>
    </FormProvider>
  )
}
