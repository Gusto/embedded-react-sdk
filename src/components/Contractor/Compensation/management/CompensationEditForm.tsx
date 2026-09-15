import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { useContractorPayForm, WageType } from '../shared/useContractorPayForm'
import styles from './CompensationEditForm.module.scss'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { Form } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'

/**
 * Props for {@link CompensationEditForm}.
 *
 * @public
 */
export interface CompensationEditFormProps extends BaseComponentInterface<'Contractor.Management.Compensation'> {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Standalone edit form for a contractor's compensation type and rate.
 *
 * @remarks
 * Renders a Fixed/Hourly compensation-type selector and, when Hourly, an
 * hourly-rate field. Save and Cancel both emit events so the parent can
 * return to the read view.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/compensation/updated` | Fired after compensation is successfully saved | The updated `Contractor` entity |
 * | `contractor/management/compensation/editCancelled` | Fired when the user clicks Cancel | — |
 *
 * @param input - See {@link CompensationEditFormProps}.
 * @returns The contractor compensation edit form.
 * @public
 */
export function CompensationEditForm({
  FallbackComponent,
  LoaderComponent,
  ...props
}: CompensationEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Compensation"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <CompensationEditFormRoot LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function CompensationEditFormRoot({
  contractorId,
  className,
  dictionary,
  onEvent,
  LoaderComponent,
}: CompensationEditFormProps) {
  useI18n('Contractor.Management.Compensation')
  useComponentDictionary('Contractor.Management.Compensation', dictionary)
  const { t } = useTranslation('Contractor.Management.Compensation')
  const Components = useComponentContext()

  const payForm = useContractorPayForm({ contractorId })

  if (payForm.isLoading) {
    return (
      <BaseLayout
        isLoading
        error={payForm.errorHandling.errors}
        LoaderComponent={LoaderComponent}
      />
    )
  }

  const { Fields } = payForm.form

  const handleSubmit = async () => {
    const result = await payForm.actions.onSubmit()
    if (!result) return
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED, result.data)
  }

  const handleCancel = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_CANCELLED)
  }

  const WageTypeFieldComponent = (radioProps: RadioGroupProps) => (
    <Components.RadioGroup
      {...radioProps}
      options={radioProps.options.map(option => ({
        ...option,
        description:
          option.value === WageType.Hourly
            ? t('form.hourlyDescription')
            : t('form.fixedDescription'),
      }))}
    />
  )

  return (
    <section className={classNames(styles.container, className)}>
      <BaseLayout error={payForm.errorHandling.errors} LoaderComponent={LoaderComponent}>
        <SDKFormProvider formHookResult={payForm}>
          <Form onSubmit={handleSubmit}>
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h2">{t('form.title')}</Components.Heading>
              <Components.Text variant="supporting">{t('form.description')}</Components.Text>
            </Flex>
            <Fields.WageType
              label={t('form.wageTypeLabel')}
              getOptionLabel={(value: string) =>
                value === WageType.Hourly ? t('hourlyLabel') : t('fixedLabel')
              }
              FieldComponent={WageTypeFieldComponent}
            />
            {payForm.status.isHourly && (
              <Fields.HourlyRate
                label={t('form.hourlyRateLabel')}
                format="currency"
                validationMessages={{
                  REQUIRED: t('form.validations.hourlyRate'),
                  MAX_HOURLY_RATE: t('form.validations.hourlyRateMax'),
                }}
              />
            )}
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleCancel} type="button">
                {t('form.cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={payForm.status.isPending}>
                {t('form.saveCta')}
              </Components.Button>
            </ActionsLayout>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
