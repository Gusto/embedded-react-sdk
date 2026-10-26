import { useTranslation } from 'react-i18next'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import { useTransitionConfigurationForm } from './shared/useTransitionConfigurationForm'
import { TransitionConfigurationPresentation } from './TransitionConfigurationPresentation'
import type { TransitionConfigurationProps } from './TransitionConfigurationTypes'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * Configures the deduction and tax withholding settings of an existing transition payroll.
 *
 * @remarks
 * A transition payroll covers the gap that opens when a company changes its pay schedule, and the
 * API creates it automatically. This component configures that payroll rather than creating one:
 * it shows the pay period, pay schedule, and payment date as read-only details, and lets the user
 * choose whether regular deductions and contributions run and how wages are withheld. The payment
 * date can't be changed here, and saving can move it.
 *
 * Deductions default to included and supplemental wages default to the regular withholding rate
 * when the payroll has no saved setting. The withholding pay period defaults to the payroll's saved
 * value, falling back to its pay schedule's frequency.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `transition/configured` | The transition payroll's settings have been saved | `{ payrollUuid: string, payrollPrepared: PayrollPrepared }` |
 *
 * @param props - See {@link TransitionConfigurationProps}.
 * @returns The transition payroll configuration form.
 * @alpha
 *
 * @example
 * ```tsx
 * import { Payroll } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <Payroll.TransitionConfiguration
 *       companyId="your-company-id"
 *       payrollId="your-transition-payroll-id"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function TransitionConfiguration({
  FallbackComponent,
  LoaderComponent,
  ...props
}: TransitionConfigurationProps) {
  return (
    <BaseBoundaries
      componentName="Payroll.TransitionConfiguration"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Root LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function Root({
  companyId,
  payrollId,
  onEvent,
  dictionary,
  className,
  LoaderComponent,
}: Omit<TransitionConfigurationProps, 'FallbackComponent'>) {
  useComponentDictionary('Payroll.TransitionConfiguration', dictionary)
  useI18n('Payroll.TransitionConfiguration')
  const { t } = useTranslation('Payroll.TransitionConfiguration')

  const transitionConfiguration = useTransitionConfigurationForm({ companyId, payrollId })

  if (transitionConfiguration.isLoading) {
    return (
      <BaseLayout
        isLoading
        error={transitionConfiguration.errorHandling.errors}
        LoaderComponent={LoaderComponent}
      />
    )
  }

  const { data, status, actions, errorHandling } = transitionConfiguration
  const { Fields } = transitionConfiguration.form

  const handleSubmit = async () => {
    const result = await actions.onSubmit()
    if (result) {
      onEvent(componentEvents.TRANSITION_CONFIGURED, {
        payrollUuid: payrollId,
        payrollPrepared: result.data,
      })
    }
  }

  const taxWithholdingConfig: OffCycleTaxWithholdingConfig = {
    withholdingPayPeriod: data.taxWithholding.withholdingPayPeriod,
    withholdingRate: data.taxWithholding.fixedWithholdingRate ? 'supplemental' : 'regular',
  }

  const handleTaxWithholdingChange = (config: OffCycleTaxWithholdingConfig) => {
    actions.setTaxWithholding({
      withholdingPayPeriod: config.withholdingPayPeriod,
      fixedWithholdingRate: config.withholdingRate === 'supplemental',
    })
  }

  return (
    <BaseLayout error={errorHandling.errors} LoaderComponent={LoaderComponent}>
      <SDKFormProvider formHookResult={transitionConfiguration}>
        <Form onSubmit={() => void handleSubmit()}>
          <TransitionConfigurationPresentation
            className={className}
            payPeriodStartDate={data.payroll.payPeriod?.startDate}
            payPeriodEndDate={data.payroll.payPeriod?.endDate}
            payScheduleName={data.paySchedule?.customName ?? data.paySchedule?.name ?? null}
            checkDate={data.checkDate}
            deductionsField={
              <Fields.SkipRegularDeductions
                label={t('deductions.title')}
                description={t('deductions.description')}
                getOptionLabel={(skipRegularDeductions: boolean) =>
                  skipRegularDeductions
                    ? t('deductions.options.skip')
                    : t('deductions.options.include')
                }
              />
            }
            taxWithholdingConfig={taxWithholdingConfig}
            onTaxWithholdingChange={handleTaxWithholdingChange}
            isPending={status.isPending}
          />
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}
