import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { usePayScheduleForm } from './usePayScheduleForm'
import type { UsePayScheduleFormProps } from './usePayScheduleForm'
import style from './PayScheduleForm.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { Flex, Grid, ActionsLayout } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'

export interface PayScheduleFormProps
  extends UsePayScheduleFormProps, Omit<BaseComponentInterface, 'defaultValues'> {}

function PayScheduleFormRoot({ onEvent, dictionary, ...hookProps }: PayScheduleFormProps) {
  useI18n('UNSTABLE.PayScheduleForm')
  useComponentDictionary('UNSTABLE.PayScheduleForm', dictionary)
  const { t } = useTranslation('UNSTABLE.PayScheduleForm')
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const paySchedule = usePayScheduleForm(hookProps)

  const [selectedPayPeriodIndex, setSelectedPayPeriodIndex] = useState(0)

  if (paySchedule.isLoading) {
    return <BaseLayout isLoading error={paySchedule.errorHandling.errors} />
  }

  const { Fields } = paySchedule.form
  const { payPeriodPreview, payPreviewLoading, paymentSpeedDays } = paySchedule.data

  const handleSubmit = async () => {
    const result = await paySchedule.actions.onSubmit()
    if (result) {
      onEvent(
        result.mode === 'create'
          ? componentEvents.PAY_SCHEDULE_CREATED
          : componentEvents.PAY_SCHEDULE_UPDATED,
        result.data,
      )
    }
  }

  const selectedPeriod = payPeriodPreview?.[selectedPayPeriodIndex]

  return (
    <BaseLayout error={paySchedule.errorHandling.errors}>
      <SDKFormProvider formHookResult={paySchedule}>
        <Form
          onSubmit={e => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <Components.Heading as="h2">
            {paySchedule.status.mode === 'create' ? t('addTitle') : t('editTitle')}
          </Components.Heading>

          <div className={style.payScheduleContainer}>
            <Grid gap={32} gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }}>
              <div className={style.payScheduleForm}>
                <Flex flexDirection="column">
                  <Fields.CustomName
                    label={t('labels.name')}
                    validationMessages={{
                      REQUIRED: t('fieldValidations.customName.REQUIRED'),
                    }}
                  />

                  <Fields.Frequency
                    label={t('labels.frequency')}
                    getOptionLabel={freq => t(`frequencies.${freq}`, freq)}
                    validationMessages={{
                      REQUIRED: t('fieldValidations.frequency.REQUIRED'),
                    }}
                  />

                  {Fields.CustomTwicePerMonth && (
                    <Fields.CustomTwicePerMonth
                      label={t('labels.frequencyOptions')}
                      description={t('descriptions.frequencyOptionsDescription')}
                    />
                  )}

                  <Fields.AnchorPayDate
                    label={t('labels.firstPayDate')}
                    description={t('descriptions.anchorPayDateDescription', {
                      count: paymentSpeedDays,
                    })}
                    validationMessages={{
                      REQUIRED: t('fieldValidations.anchorPayDate.REQUIRED'),
                    }}
                  />

                  <Fields.AnchorEndOfPayPeriod
                    label={t('labels.firstPayPeriodEndDate')}
                    description={t('descriptions.anchorEndOfPayPeriodDescription')}
                    validationMessages={{
                      REQUIRED: t('fieldValidations.anchorEndOfPayPeriod.REQUIRED'),
                    }}
                  />

                  {Fields.Day1 ? (
                    <Fields.Day1
                      label={t('labels.firstPayDayOfTheMonth')}
                      validationMessages={{
                        REQUIRED: t('fieldValidations.day1.REQUIRED'),
                        DAY_RANGE: t('fieldValidations.day1.DAY_RANGE'),
                      }}
                    />
                  ) : (
                    <div className={style.visuallyHidden} />
                  )}

                  {Fields.Day2 ? (
                    <Fields.Day2
                      label={t('labels.lastPayDayOfTheMonth')}
                      validationMessages={{
                        REQUIRED: t('fieldValidations.day2.REQUIRED'),
                        DAY_RANGE: t('fieldValidations.day2.DAY_RANGE'),
                      }}
                    />
                  ) : (
                    <div className={style.visuallyHidden} />
                  )}
                </Flex>
              </div>

              <Flex flexDirection="column" gap={4} justifyContent="center" alignItems="center">
                {payPeriodPreview && selectedPeriod ? (
                  <div className={style.calendarContainer}>
                    {!payPreviewLoading && (
                      <Components.Select
                        label={t('labels.preview')}
                        isRequired
                        options={payPeriodPreview.map((period, index) => ({
                          value: String(index),
                          label: dateFormatter.formatPayPeriodRange(
                            period.startDate.toString(),
                            period.endDate.toString(),
                          ),
                        }))}
                        value={String(selectedPayPeriodIndex)}
                        onChange={(value: string) => {
                          const numericValue = Number(value)
                          if (!isNaN(numericValue)) {
                            setSelectedPayPeriodIndex(numericValue)
                          }
                        }}
                      />
                    )}
                    <Components.CalendarPreview
                      key={selectedPayPeriodIndex}
                      dateRange={{
                        start: new Date(selectedPeriod.startDate.toString()),
                        end: new Date(selectedPeriod.endDate.toString()),
                        label: t('payPreview.payPeriod'),
                      }}
                      highlightDates={[
                        {
                          date: new Date(selectedPeriod.checkDate.toString()),
                          highlightColor: 'primary',
                          label: t('payPreview.payday'),
                        },
                        {
                          date: new Date(selectedPeriod.runPayrollBy.toString()),
                          highlightColor: 'secondary',
                          label: t('payPreview.payrollDeadline'),
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <div className={style.calendarContainer}>
                    <Components.Alert
                      status="info"
                      label={t('previewAlert.title')}
                      disableScrollIntoView
                    >
                      <Components.Text>{t('previewAlert.description')}</Components.Text>
                    </Components.Alert>
                  </div>
                )}
              </Flex>
            </Grid>
          </div>

          <ActionsLayout>
            <Components.Button type="submit" isLoading={paySchedule.status.isPending}>
              {t('saveCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

export function PayScheduleForm({ FallbackComponent, ...props }: PayScheduleFormProps) {
  return (
    <BaseBoundaries componentName="UNSTABLE.PayScheduleForm" FallbackComponent={FallbackComponent}>
      <PayScheduleFormRoot {...props} />
    </BaseBoundaries>
  )
}
