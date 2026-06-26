import { useCallback, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsCreateOffCycle'
import {
  OffCycleReason,
  WithholdingPayPeriod,
} from '@gusto/embedded-api-v-2025-11-15/models/operations/postv1companiescompanyidpayrolls'
import { RFCDate } from '@gusto/embedded-api-v-2025-11-15/types/rfcdate'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/paySchedulesGetAll'
import { useOffCyclePayPeriodDateValidation } from '../OffCyclePayPeriodDateForm/useOffCyclePayPeriodDateValidation'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { TransitionCreationProps, TransitionCreationFormData } from './TransitionCreationTypes'
import { createTransitionCreationSchema } from './TransitionCreationTypes'
import { TransitionCreationPresentation } from './TransitionCreationPresentation'
import { useCompanyPaymentSpeed } from '@/hooks/useCompanyPaymentSpeed'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { SDKInternalError } from '@/types/sdkError'
import { Form } from '@/components/Common/Form'

/**
 * Creation form for transition payrolls covering the gap between an old and new pay schedule.
 *
 * Displays the transition pay period and pay schedule information, and collects a check
 * date, deduction preference, and tax withholding configuration before submitting the
 * resulting off-cycle payroll for execution.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `transition/created` | The transition payroll has been created | `{ payrollUuid: string }` |
 *
 * The check date must be at least the company's ACH lead time (typically two business
 * days) from today. Deductions default to included and tax withholding defaults to the
 * regular rate with an every-other-week pay period.
 *
 * @param props - {@link TransitionCreationProps} plus base component props.
 * @returns The transition payroll creation form.
 * @public
 */
export function TransitionCreation(props: TransitionCreationProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({
  dictionary,
  companyId,
  startDate,
  endDate,
  payScheduleUuid,
}: TransitionCreationProps) {
  useComponentDictionary('Payroll.TransitionCreation', dictionary)
  useI18n('Payroll.TransitionCreation')
  useI18n('Payroll.OffCycleDeductionsSetting')
  useI18n('Payroll.OffCycleTaxWithholding')

  const { t } = useTranslation('Payroll.TransitionCreation')
  const { onEvent, baseSubmitHandler } = useBase()

  const { paymentSpeedDays } = useCompanyPaymentSpeed(companyId)

  const { minCheckDate } = useOffCyclePayPeriodDateValidation(paymentSpeedDays)
  const { mutateAsync: createTransitionPayroll, isPending } = usePayrollsCreateOffCycleMutation()

  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({ companyId })

  const [taxWithholdingConfig, setTaxWithholdingConfig] = useState<OffCycleTaxWithholdingConfig>({
    withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: 'regular',
  })
  const [isTaxWithholdingModalOpen, setIsTaxWithholdingModalOpen] = useState(false)

  const handleTaxWithholdingEditClick = useCallback(() => {
    setIsTaxWithholdingModalOpen(true)
  }, [])

  const handleTaxWithholdingModalDone = useCallback((config: OffCycleTaxWithholdingConfig) => {
    setTaxWithholdingConfig(config)
    setIsTaxWithholdingModalOpen(false)
  }, [])

  const handleTaxWithholdingModalCancel = useCallback(() => {
    setIsTaxWithholdingModalOpen(false)
  }, [])

  const payScheduleName = useMemo(() => {
    const schedules = paySchedulesData.payScheduleShowResponse ?? []
    const match = schedules.find(s => s.uuid === payScheduleUuid)
    return match?.customName ?? match?.name ?? null
  }, [paySchedulesData, payScheduleUuid])

  const translateValidation = (key: string, options?: Record<string, unknown>): string =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t(key as any, options as any) as string

  const schema = useMemo(
    () => createTransitionCreationSchema(translateValidation, minCheckDate, paymentSpeedDays),
    [t, minCheckDate, paymentSpeedDays],
  )

  const methods = useForm<TransitionCreationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      checkDate: null,
      skipRegularDeductions: false,
    },
  })

  const onSubmit = async (data: TransitionCreationFormData) => {
    if (!data.checkDate) return

    await baseSubmitHandler(data, async () => {
      const response = await createTransitionPayroll({
        request: {
          companyId,
          requestBody: {
            offCycle: true,
            offCycleReason: OffCycleReason.TransitionFromOldPaySchedule,
            startDate: new RFCDate(startDate),
            endDate: new RFCDate(endDate),
            checkDate: new RFCDate(data.checkDate!),
            payScheduleUuid,
            skipRegularDeductions: data.skipRegularDeductions,
            withholdingPayPeriod: taxWithholdingConfig.withholdingPayPeriod,
            fixedWithholdingRate: taxWithholdingConfig.withholdingRate === 'supplemental',
          },
        },
      })

      const payrollUuid =
        response.payrollUnprocessed?.payrollUuid ?? response.payrollUnprocessed?.uuid

      if (!payrollUuid) {
        throw new SDKInternalError(t('errors.missingPayrollId'))
      }

      onEvent(componentEvents.TRANSITION_CREATED, { payrollUuid })
    })
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <TransitionCreationPresentation
          startDate={startDate}
          endDate={endDate}
          payScheduleName={payScheduleName}
          isPending={isPending}
          taxWithholdingConfig={taxWithholdingConfig}
          isTaxWithholdingModalOpen={isTaxWithholdingModalOpen}
          onTaxWithholdingEditClick={handleTaxWithholdingEditClick}
          onTaxWithholdingModalDone={handleTaxWithholdingModalDone}
          onTaxWithholdingModalCancel={handleTaxWithholdingModalCancel}
        />
      </Form>
    </FormProvider>
  )
}
