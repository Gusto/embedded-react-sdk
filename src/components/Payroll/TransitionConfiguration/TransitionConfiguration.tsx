import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import { PREPARE_QUERY_KEY } from '../PayrollConfiguration/usePayrollConfigurationData'
import type {
  TransitionConfigurationFormData,
  TransitionConfigurationProps,
} from './TransitionConfigurationTypes'
import { createTransitionConfigurationSchema } from './TransitionConfigurationTypes'
import { TransitionConfigurationPresentation } from './TransitionConfigurationPresentation'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { SDKInternalError } from '@/types/sdkError'

const transitionConfigurationSchema = createTransitionConfigurationSchema()

type VersionedEmployeeCompensation = PayrollEmployeeCompensationsType & {
  employeeUuid: string
  version: string
}

function isVersionedEmployeeCompensation(
  compensation: PayrollEmployeeCompensationsType,
): compensation is VersionedEmployeeCompensation {
  return typeof compensation.employeeUuid === 'string' && typeof compensation.version === 'string'
}

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
export function TransitionConfiguration(props: TransitionConfigurationProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ dictionary, companyId, payrollId, className }: TransitionConfigurationProps) {
  useComponentDictionary('Payroll.TransitionConfiguration', dictionary)
  useI18n('Payroll.TransitionConfiguration')

  const { t } = useTranslation('Payroll.TransitionConfiguration')
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const { data: payrollData } = usePayrollsGetSuspense({ companyId, payrollId })
  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({ companyId })
  const { mutateAsync: preparePayroll, isPending: isPreparePending } = usePayrollsPrepareMutation()
  const { mutateAsync: updatePayroll, isPending: isUpdatePending } = usePayrollsUpdateMutation()

  const payroll = payrollData.payrollShow
  const paySchedule = paySchedulesData.payScheduleShowResponse?.find(
    schedule => schedule.uuid === payroll?.payPeriod?.payScheduleUuid,
  )

  const [taxWithholdingConfig, setTaxWithholdingConfig] = useState<OffCycleTaxWithholdingConfig>({
    withholdingPayPeriod:
      payroll?.withholdingPayPeriod ??
      paySchedule?.frequency ??
      WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: payroll?.fixedWithholdingRate ? 'supplemental' : 'regular',
  })
  const [isTaxWithholdingModalOpen, setIsTaxWithholdingModalOpen] = useState(false)
  const [savedCheckDate, setSavedCheckDate] = useState<string | null>(null)

  const methods = useForm<TransitionConfigurationFormData>({
    resolver: zodResolver(transitionConfigurationSchema),
    defaultValues: {
      skipRegularDeductions: payroll?.skipRegularDeductions ?? false,
    },
  })

  const handleTaxWithholdingModalDone = (config: OffCycleTaxWithholdingConfig) => {
    setTaxWithholdingConfig(config)
    setIsTaxWithholdingModalOpen(false)
  }

  const onSubmit = async (data: TransitionConfigurationFormData) => {
    await baseSubmitHandler(data, async ({ skipRegularDeductions }) => {
      const prepareResponse = await preparePayroll({
        request: { companyId, payrollId, requestBody: {} },
      })

      const compensation = prepareResponse.payrollPrepared?.employeeCompensations?.find(
        isVersionedEmployeeCompensation,
      )
      if (!compensation) {
        throw new SDKInternalError(t('errors.noEmployeeCompensations'))
      }

      const updateResponse = await updatePayroll({
        request: {
          companyId,
          payrollId,
          payrollUpdate: {
            employeeCompensations: [
              { employeeUuid: compensation.employeeUuid, version: compensation.version },
            ],
            skipRegularDeductions,
            withholdingPayPeriod: taxWithholdingConfig.withholdingPayPeriod,
            fixedWithholdingRate: taxWithholdingConfig.withholdingRate === 'supplemental',
          },
        },
      })

      setSavedCheckDate(updateResponse.payrollPrepared?.checkDate ?? null)

      await queryClient.invalidateQueries({ queryKey: [PREPARE_QUERY_KEY, payrollId] })

      onEvent(componentEvents.TRANSITION_CONFIGURED, {
        payrollUuid: payrollId,
        payrollPrepared: updateResponse.payrollPrepared,
      })
    })
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <TransitionConfigurationPresentation
          className={className}
          payPeriodStartDate={payroll?.payPeriod?.startDate}
          payPeriodEndDate={payroll?.payPeriod?.endDate}
          payScheduleName={paySchedule?.customName ?? paySchedule?.name ?? null}
          checkDate={savedCheckDate ?? payroll?.checkDate ?? null}
          isPending={isPreparePending || isUpdatePending}
          taxWithholdingConfig={taxWithholdingConfig}
          isTaxWithholdingModalOpen={isTaxWithholdingModalOpen}
          onTaxWithholdingEditClick={() => {
            setIsTaxWithholdingModalOpen(true)
          }}
          onTaxWithholdingModalDone={handleTaxWithholdingModalDone}
          onTaxWithholdingModalCancel={() => {
            setIsTaxWithholdingModalOpen(false)
          }}
        />
      </Form>
    </FormProvider>
  )
}
