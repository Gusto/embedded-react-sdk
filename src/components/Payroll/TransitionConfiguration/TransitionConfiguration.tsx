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
 * Lets the user change the settings of a transition payroll before running it.
 *
 * @remarks
 * The API creates transition payrolls on its own. This component updates one. It never creates one.
 *
 * - The pay period, pay schedule, and payment date are shown but can't be changed.
 * - The user can choose to take or skip regular deductions, and how to withhold taxes.
 *
 * If a setting is empty, deductions are taken, the regular tax rate is used, and the pay frequency
 * matches the pay schedule. Saving can change the payment date.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `transition/configured` | The settings were saved | `{ payrollUuid: string, payrollPrepared: PayrollPrepared }` |
 *
 * @param props - See {@link TransitionConfigurationProps}.
 * @returns The transition payroll settings form.
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
