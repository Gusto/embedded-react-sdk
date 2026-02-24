import { FormProvider, useForm, type Resolver } from 'react-hook-form'
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
import { Form } from '@/components/Common/Form'

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
  const { t: tCreation } = useTranslation('Payroll.OffCycleCreation')
  const { onEvent, baseSubmitHandler } = useBase()

  const { minCheckDate, today } = useOffCyclePayPeriodDateValidation()
  const { mutateAsync: createOffCyclePayroll, isPending } = usePayrollsCreateOffCycleMutation()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translateValidation = (key: string): string => t(key as any) as string

  const dynamicResolver: Resolver<OffCycleCreationFormData> = (values, context, options) => {
    const reason = values.reason
    const isCheckOnly = values.isCheckOnly
    const resolvedPayrollType: OffCyclePayrollDateType =
      reason === 'correction' ? 'correction' : payrollType

    const dateSchema = createOffCyclePayPeriodDateFormSchema(
      translateValidation,
      resolvedPayrollType,
      isCheckOnly ? today : minCheckDate,
    )
    const schema = z.object({ reason: z.enum(['bonus', 'correction']) }).and(dateSchema)

    return zodResolver(schema)(values, context, options)
  }

  const methods = useForm<OffCycleCreationFormData>({
    resolver: dynamicResolver,
    defaultValues: {
      reason: payrollType,
      isCheckOnly: false,
      startDate: null,
      endDate: null,
      checkDate: null,
    },
  })

  const onSubmit = async (data: OffCycleCreationFormData) => {
    const reason = data.reason
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
        throw new Error(tCreation('errors.missingPayrollId'))
      }

      onEvent(componentEvents.OFF_CYCLE_CREATED, { payrollUuid })
    })
  }

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <OffCycleCreationPresentation isPending={isPending} />
      </Form>
    </FormProvider>
  )
}
