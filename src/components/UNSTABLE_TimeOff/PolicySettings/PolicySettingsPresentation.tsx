import classNames from 'classnames'
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
}: PolicySettingsPresentationProps) {
  useI18n('Company.TimeOff.CreateTimeOffPolicy')
  const { t } = useTranslation('Company.TimeOff.CreateTimeOffPolicy')
  const { Heading, Button } = useComponentContext()

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

  const handleSubmit = (data: PolicySettingsFormData) => {
    onContinue(data)
  }

  return (
    <FormProvider {...formMethods}>
      <HtmlForm onSubmit={formMethods.handleSubmit(handleSubmit)}>
        <div className={styles.policySettings}>
          <Flex flexDirection="column" gap={32}>
            <Heading as="h2">{t('policySettings.title')}</Heading>

            <Flex flexDirection="column" gap={20}>
              {isHoursWorked && (
                <>
                  <div className={styles.settingRow}>
                    <NumberInputField
                      className={classNames(
                        styles.settingField,
                        !accrualMaximumEnabled && styles.disabledField,
                      )}
                      name="accrualMaximum"
                      label={t('policySettings.accrualMaximumLabel')}
                      description={t('policySettings.accrualMaximumHint')}
                      adornmentEnd={t('policySettings.hoursUnit')}
                      placeholder={t('policySettings.numberOfHoursPlaceholder')}
                      isDisabled={!accrualMaximumEnabled}
                      min={0}
                    />
                    <div className={styles.toggleCell}>
                      <SwitchField
                        name="accrualMaximumEnabled"
                        label={t('policySettings.accrualMaximumLabel')}
                        shouldVisuallyHideLabel
                      />
                    </div>
                  </div>

                  <hr className={styles.divider} />
                </>
              )}

              <div className={styles.settingRow}>
                <NumberInputField
                  className={classNames(
                    styles.settingField,
                    !balanceMaximumEnabled && styles.disabledField,
                  )}
                  name="balanceMaximum"
                  label={t('policySettings.balanceMaximumLabel')}
                  description={t('policySettings.balanceMaximumHint')}
                  adornmentEnd={t('policySettings.hoursUnit')}
                  placeholder={t('policySettings.numberOfHoursPlaceholder')}
                  isDisabled={!balanceMaximumEnabled}
                  min={0}
                />
                <div className={styles.toggleCell}>
                  <SwitchField
                    name="balanceMaximumEnabled"
                    label={t('policySettings.balanceMaximumLabel')}
                    shouldVisuallyHideLabel
                  />
                </div>
              </div>

              <hr className={styles.divider} />

              <div className={styles.settingRow}>
                <NumberInputField
                  className={classNames(
                    styles.settingField,
                    !carryOverLimitEnabled && styles.disabledField,
                  )}
                  name="carryOverLimit"
                  label={t('policySettings.carryOverLimitLabel')}
                  description={t('policySettings.carryOverLimitHint')}
                  adornmentEnd={t('policySettings.hoursUnit')}
                  placeholder={t('policySettings.numberOfHoursPlaceholder')}
                  isDisabled={!carryOverLimitEnabled}
                  min={0}
                />
                <div className={styles.toggleCell}>
                  <SwitchField
                    name="carryOverLimitEnabled"
                    label={t('policySettings.carryOverLimitLabel')}
                    shouldVisuallyHideLabel
                  />
                </div>
              </div>

              <hr className={styles.divider} />

              {isHoursWorked && (
                <>
                  <div className={styles.settingRow}>
                    <NumberInputField
                      className={classNames(
                        styles.settingField,
                        !waitingPeriodEnabled && styles.disabledField,
                      )}
                      name="waitingPeriod"
                      label={t('policySettings.waitingPeriodLabel')}
                      description={t('policySettings.waitingPeriodHint')}
                      adornmentEnd={t('policySettings.daysUnit')}
                      placeholder={t('policySettings.numberOfDaysPlaceholder')}
                      isDisabled={!waitingPeriodEnabled}
                      min={0}
                    />
                    <div className={styles.toggleCell}>
                      <SwitchField
                        name="waitingPeriodEnabled"
                        label={t('policySettings.waitingPeriodLabel')}
                        shouldVisuallyHideLabel
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
                <Button variant="secondary" onClick={onBack}>
                  {t('backCta')}
                </Button>
                <Button variant="primary" type="submit">
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
