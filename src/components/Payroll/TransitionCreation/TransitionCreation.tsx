import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api/react-query/payrollsCreateOffCycle'
import { OffCycleReason } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { useOffCyclePayPeriodDateValidation } from '../OffCyclePayPeriodDateForm/useOffCyclePayPeriodDateValidation'
import type { TransitionCreationProps, TransitionCreationFormData } from './TransitionCreationTypes'
import { TransitionCreationPresentation } from './TransitionCreationPresentation'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Form } from '@/components/Common/Form'

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

  const { t } = useTranslation('Payroll.TransitionCreation')
  const { onEvent, baseSubmitHandler } = useBase()

  const { minCheckDate } = useOffCyclePayPeriodDateValidation()
  const { mutateAsync: createTransitionPayroll, isPending } = usePayrollsCreateOffCycleMutation()

  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({ companyId })

  const payScheduleName = useMemo(() => {
    const schedules = paySchedulesData.payScheduleList ?? []
    const match = schedules.find(s => s.uuid === payScheduleUuid)
    return match?.name ?? match?.customName ?? null
  }, [paySchedulesData, payScheduleUuid])

  const schema = useMemo(
    () =>
      z.object({
        checkDate: z
          .date()
          .nullable()
          .refine((val): val is Date => val !== null, {
            message: t('errors.checkDateRequired'),
          })
          .refine(
            val => {
              const normalized = new Date(val)
              normalized.setHours(0, 0, 0, 0)
              const min = new Date(minCheckDate)
              min.setHours(0, 0, 0, 0)
              return normalized >= min
            },
            { message: t('errors.checkDateAchLeadTime') },
          ),
      }),
    [t, minCheckDate],
  )

  const methods = useForm<TransitionCreationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      checkDate: null,
    },
  })

  const onSubmit = async (data: TransitionCreationFormData) => {
    const checkDate = data.checkDate!

    await baseSubmitHandler(data, async () => {
      const response = await createTransitionPayroll({
        request: {
          companyId,
          requestBody: {
            offCycle: true,
            offCycleReason: OffCycleReason.TransitionFromOldPaySchedule,
            startDate: new RFCDate(startDate),
            endDate: new RFCDate(endDate),
            checkDate: new RFCDate(checkDate),
            payScheduleUuid,
          },
        },
      })

      const payrollUuid = response.payrollPrepared?.payrollUuid ?? response.payrollPrepared?.uuid

      if (!payrollUuid) {
        throw new Error(t('errors.missingPayrollId'))
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
        />
      </Form>
    </FormProvider>
  )
}
