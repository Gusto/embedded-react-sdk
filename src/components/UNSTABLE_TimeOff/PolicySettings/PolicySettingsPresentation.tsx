import type { CSSProperties } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { PolicySettingsFormData, PolicySettingsPresentationProps } from './PolicySettingsTypes'
import styles from './PolicySettings.module.scss'
import { Flex, ActionsLayout, NumberInputField, SwitchField } from '@/components/Common'
import { Form as HtmlForm } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: 20,
  alignItems: 'start',
  width: '100%',
}

const toggleCellStyle: CSSProperties = {
  paddingTop: 2,
}

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
                  <div style={rowStyle}>
                    <div className={styles.settingField}>
                      <NumberInputField
                        className={!accrualMaximumEnabled ? styles.disabledField : undefined}
                        name="accrualMaximum"
                        label={t('policySettings.accrualMaximumLabel')}
                        description={t('policySettings.accrualMaximumHint')}
                        adornmentEnd={t('policySettings.hoursUnit')}
                        placeholder={t('policySettings.numberOfHoursPlaceholder')}
                        isDisabled={!accrualMaximumEnabled}
                        min={0}
                      />
                    </div>
                    <div style={toggleCellStyle}>
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

              <div style={rowStyle}>
                <div className={styles.settingField}>
                  <NumberInputField
                    className={!balanceMaximumEnabled ? styles.disabledField : undefined}
                    name="balanceMaximum"
                    label={t('policySettings.balanceMaximumLabel')}
                    description={t('policySettings.balanceMaximumHint')}
                    adornmentEnd={t('policySettings.hoursUnit')}
                    placeholder={t('policySettings.numberOfHoursPlaceholder')}
                    isDisabled={!balanceMaximumEnabled}
                    min={0}
                  />
                </div>
                <div style={toggleCellStyle}>
                  <SwitchField
                    name="balanceMaximumEnabled"
                    label={t('policySettings.balanceMaximumLabel')}
                    shouldVisuallyHideLabel
                  />
                </div>
              </div>

              <hr className={styles.divider} />

              <div style={rowStyle}>
                <div className={styles.settingField}>
                  <NumberInputField
                    className={!carryOverLimitEnabled ? styles.disabledField : undefined}
                    name="carryOverLimit"
                    label={t('policySettings.carryOverLimitLabel')}
                    description={t('policySettings.carryOverLimitHint')}
                    adornmentEnd={t('policySettings.hoursUnit')}
                    placeholder={t('policySettings.numberOfHoursPlaceholder')}
                    isDisabled={!carryOverLimitEnabled}
                    min={0}
                  />
                </div>
                <div style={toggleCellStyle}>
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
                  <div style={rowStyle}>
                    <div className={styles.settingField}>
                      <NumberInputField
                        className={!waitingPeriodEnabled ? styles.disabledField : undefined}
                        name="waitingPeriod"
                        label={t('policySettings.waitingPeriodLabel')}
                        description={t('policySettings.waitingPeriodHint')}
                        adornmentEnd={t('policySettings.daysUnit')}
                        placeholder={t('policySettings.numberOfDaysPlaceholder')}
                        isDisabled={!waitingPeriodEnabled}
                        min={0}
                      />
                    </div>
                    <div style={toggleCellStyle}>
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
