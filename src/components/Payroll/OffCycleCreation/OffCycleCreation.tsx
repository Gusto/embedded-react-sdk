import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api/react-query/payrollsCreateOffCycle'
import { OffCycleReason as ApiOffCycleReason } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { OFF_CYCLE_REASON_DEFAULTS, type OffCycleReason } from '../OffCycleReasonSelection'
import {
  createOffCyclePayPeriodDateFormSchema,
  type OffCyclePayrollDateType,
} from '../OffCyclePayPeriodDateForm/OffCyclePayPeriodDateFormTypes'
import { useOffCyclePayPeriodDateValidation } from '../OffCyclePayPeriodDateForm/useOffCyclePayPeriodDateValidation'
import type { OffCycleCreationFormData, OffCycleCreationProps } from './OffCycleCreationTypes'
import { OffCycleCreationPresentation } from './OffCycleCreationPresentation'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

const LOCAL_TO_API_REASON: Record<OffCycleReason, ApiOffCycleReason> = {
  bonus: ApiOffCycleReason.Bonus,
  correction: ApiOffCycleReason.Correction,
}

export function OffCycleCreation(props: OffCycleCreationProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ dictionary, companyId, payrollType = 'bonus' }: OffCycleCreationProps) {
  useComponentDictionary('Payroll.OffCycleCreation', dictionary)
  useI18n('Payroll.OffCycleCreation')
  useI18n('Payroll.OffCycleReasonSelection')
  useI18n('Payroll.OffCyclePayPeriodDateForm')

  const { t } = useTranslation('Payroll.OffCyclePayPeriodDateForm')
  const { onEvent, baseSubmitHandler } = useBase()

  const [selectedReason, setSelectedReason] = useState<OffCycleReason>(payrollType)
  const [isCheckOnly, setIsCheckOnly] = useState(false)
  const [resolvedPayrollType, setResolvedPayrollType] =
    useState<OffCyclePayrollDateType>(payrollType)

  const { minCheckDate, today } = useOffCyclePayPeriodDateValidation()
  const { mutateAsync: createOffCyclePayroll, isPending } = usePayrollsCreateOffCycleMutation()

  const schema = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const translateValidation = (key: string): string => t(key as any) as string

    const dateSchema = createOffCyclePayPeriodDateFormSchema(
      translateValidation,
      resolvedPayrollType,
      isCheckOnly ? today : minCheckDate,
    )
    return z.object({ reason: z.enum(['bonus', 'correction']) }).and(dateSchema)
  }, [t, resolvedPayrollType, isCheckOnly, today, minCheckDate])

  const methods = useForm<OffCycleCreationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: payrollType,
      isCheckOnly: false,
      startDate: null,
      endDate: null,
      checkDate: null,
    },
  })

  const handleReasonChange = (reason: OffCycleReason) => {
    setSelectedReason(reason)
    methods.setValue('reason', reason)

    const newPayrollType: OffCyclePayrollDateType = reason === 'correction' ? 'correction' : 'bonus'
    setResolvedPayrollType(newPayrollType)
  }

  const handleCheckOnlyChange = (checked: boolean) => {
    setIsCheckOnly(checked)
    methods.setValue('isCheckOnly', checked)
    if (checked) {
      methods.setValue('startDate', null)
      methods.setValue('endDate', null)
    }
  }

  const onSubmit = async (data: OffCycleCreationFormData) => {
    const reason = selectedReason
    const defaults = OFF_CYCLE_REASON_DEFAULTS[reason]
    const checkDate = data.checkDate!
    const startDate = data.isCheckOnly ? checkDate : data.startDate!
    const endDate = data.isCheckOnly ? checkDate : data.endDate!

    await baseSubmitHandler(data, async () => {
      const response = await createOffCyclePayroll({
        request: {
          companyId,
          requestBody: {
            offCycle: true,
            offCycleReason: LOCAL_TO_API_REASON[reason],
            startDate: new RFCDate(startDate),
            endDate: new RFCDate(endDate),
            checkDate: new RFCDate(checkDate),
            skipRegularDeductions: defaults.skipDeductions,
            isCheckOnlyPayroll: data.isCheckOnly,
          },
        },
      })

      const payrollUuid = response.payrollPrepared?.payrollUuid ?? response.payrollPrepared?.uuid

      if (!payrollUuid) {
        throw new Error('Off-cycle payroll was created but no payroll ID was returned')
      }

      onEvent(componentEvents.OFF_CYCLE_CREATED, { payrollUuid })
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <OffCycleCreationPresentation
          selectedReason={selectedReason}
          onReasonChange={handleReasonChange}
          isCheckOnly={isCheckOnly}
          onCheckOnlyChange={handleCheckOnlyChange}
          isPending={isPending}
        />
      </form>
    </FormProvider>
  )
}
