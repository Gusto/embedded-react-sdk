import { useTranslation } from 'react-i18next'
import { FormProvider, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import {
  NumberInputField,
  TextInputField,
  RadioGroupField,
  CheckboxField,
} from '@/components/Common'
import { type CommonComponentInterface, useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export const DeductionSchema = z.object({
  active: z.boolean(),
  amount: z.number().min(0).transform(String),
  description: z.string().min(1),
  courtOrdered: z.boolean(),
  times: z.number().nullable(),
  recurring: z.string().transform(val => val === 'true'),
  annualMaximum: z
    .number()
    .min(0)
    .transform(val => (val > 0 ? val.toString() : null))
    .nullable(),
  payPeriodMaximum: z
    .number()
    .min(0)
    .transform(val => (val > 0 ? val.toString() : null))
    .nullable(),
  deductAsPercentage: z.string().transform(val => val === 'true'),
})

export type DeductionInputs = z.input<typeof DeductionSchema>
export type DeductionPayload = z.output<typeof DeductionSchema>

interface ChildSupportFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
  deduction?: Garnishment | null
}

function CustomDeductionForm({ deduction, employeeId }: ChildSupportFormProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  const { mutateAsync: createDeduction, isPending: isPendingCreate } =
    useGarnishmentsCreateMutation()
  const { mutateAsync: updateDeduction, isPending: isPendingUpdate } =
    useGarnishmentsUpdateMutation()
  const isPending = isPendingCreate || isPendingUpdate

  const defaultValues: DeductionInputs = useMemo(() => {
    return {
      amount: deduction?.amount ? Number(deduction.amount) : 0,
      description: deduction?.description ?? '',
      times: deduction?.times ?? null,
      recurring: deduction?.recurring?.toString() ?? 'true',
      annualMaximum: deduction?.annualMaximum ? Number(deduction.annualMaximum) : null,
      payPeriodMaximum: deduction?.payPeriodMaximum ? Number(deduction.payPeriodMaximum) : null,
      deductAsPercentage: deduction?.deductAsPercentage?.toString() ?? 'true',
      active: true,
      courtOrdered: deduction?.courtOrdered ?? false,
    } as DeductionInputs
  }, [deduction])

  const formMethods = useForm<DeductionInputs, unknown, DeductionPayload>({
    resolver: zodResolver(DeductionSchema),
    defaultValues,
  })
  const { reset: resetForm, control } = formMethods

  useEffect(() => {
    resetForm(defaultValues)
  }, [deduction, defaultValues, resetForm])

  const watchedRecurring = useWatch({ control, name: 'recurring' })

  const onSubmit: SubmitHandler<DeductionPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      if (!deduction) {
        const { garnishment: createDeductionResponse } = await createDeduction({
          request: {
            employeeId: employeeId,
            requestBody: { ...payload, times: payload.recurring ? null : 1 },
          },
        })

        onEvent(componentEvents.EMPLOYEE_DEDUCTION_CREATED, createDeductionResponse)
      } else {
        const { garnishment: updateDeductionResponse } = await updateDeduction({
          request: {
            garnishmentId: deduction.uuid,
            requestBody: {
              ...payload,
              version: deduction.version as string,
              times: payload.recurring ? null : 1,
            },
          },
        })
        onEvent(componentEvents.EMPLOYEE_DEDUCTION_UPDATED, updateDeductionResponse)
      }
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_CANCEL)
  }

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Flex flexDirection="column" gap={32}>
          <>
            <TextInputField name="description" label={t('descriptionLabel')} isRequired />
            <RadioGroupField
              name="deductAsPercentage"
              label={t('deductionTypeLabel')}
              isRequired
              options={[
                { value: 'true', label: t('deductionTypePercentageOption') },
                { value: 'false', label: t('deductionTypeFixedAmountOption') },
              ]}
            />
            <NumberInputField name="amount" label={t('deductionAmountLabel')} isRequired min={0} />
            <RadioGroupField
              name="recurring"
              label={t('frequencyLabel')}
              isRequired
              options={[
                { value: 'true', label: t('frequencyRecurringOption') },
                { value: 'false', label: t('frequencyOneTimeOption') },
              ]}
            />
            {watchedRecurring === 'true' && (
              <>
                <NumberInputField name="annualMaximum" label={t('annualMaxLabel')} min={0} />
                <NumberInputField name="payPeriodMaximum" label="Pay period maximum" min={0} />
              </>
            )}
            <CheckboxField
              name="courtOrdered"
              label={t('courtOrderedLabel')}
              isDisabled={!!deduction}
            />
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleCancel}>
                {t('cancelCta')}
              </Components.Button>
              <Components.Button type="submit" isLoading={isPending}>
                {!deduction ? t('addDeductionCta') : t('continueCta')}
              </Components.Button>
            </ActionsLayout>
          </>
        </Flex>
      </Form>
    </FormProvider>
  )
}

export default CustomDeductionForm
