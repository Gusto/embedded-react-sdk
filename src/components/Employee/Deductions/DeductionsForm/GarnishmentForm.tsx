import { useTranslation } from 'react-i18next'
import { FormProvider, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { useMemo } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { GarnishmentType } from '@gusto/embedded-api/models/operations/postv1employeesemployeeidgarnishments'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { NumberInputField, TextInputField, RadioGroupField } from '@/components/Common'
import { type CommonComponentInterface, useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export const DeductionSchema = z.object({
  active: z.boolean(),
  amount: z.number().min(0).transform(String),
  description: z.string().min(1),
  courtOrdered: z.boolean(),
  times: z.number().nullable(),
  recurring: z.boolean(),
  annualMaximum: z
    .number()
    .min(0)
    .transform(val => (val > 0 ? val.toString() : null))
    .nullable(),
  totalAmount: z
    .number()
    .min(0)
    .transform(val => (val > 0 ? val.toString() : null))
    .nullable(),
  deductAsPercentage: z.boolean(),
  garnishmentType: z.nativeEnum(GarnishmentType),
})

export type DeductionInputs = z.input<typeof DeductionSchema>
export type DeductionPayload = z.output<typeof DeductionSchema>

interface GarnishmentFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
  deduction?: Garnishment | null
  selectedGarnishmentType: GarnishmentType
  selectedGarnishmentTitle: string
}

function GarnishmentForm({
  deduction,
  employeeId,
  selectedGarnishmentType,
  selectedGarnishmentTitle,
}: GarnishmentFormProps) {
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
      recurring: deduction?.recurring ?? true,
      annualMaximum: deduction?.annualMaximum ? Number(deduction.annualMaximum) : null,
      totalAmount: deduction?.totalAmount ? Number(deduction.totalAmount) : null,
      deductAsPercentage: deduction?.deductAsPercentage ?? true,
      active: true,
      courtOrdered: true,
      garnishmentType: deduction?.garnishmentType ?? selectedGarnishmentType,
    }
  }, [deduction])

  const formMethods = useForm<DeductionInputs, unknown, DeductionPayload>({
    resolver: zodResolver(DeductionSchema),
    defaultValues,
  })
  const { control } = formMethods
  const watchedRecurring = useWatch({ control, name: 'recurring' })
  const watchedAmountPercentage = useWatch({ control, name: 'deductAsPercentage' })

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
            <Components.Heading as="h3">{selectedGarnishmentTitle}</Components.Heading>
            <TextInputField name="description" label={t('descriptionLabelV2')} isRequired />
            <RadioGroupField
              name="recurring"
              label={t('frequencyLabel')}
              isRequired
              options={[
                { value: true, label: t('frequencyRecurringOptionV2') },
                { value: false, label: t('frequencyOneTimeOptionV2') },
              ]}
            />
            <RadioGroupField
              name="deductAsPercentage"
              label={t('deductionTypeLabelV2')}
              isRequired
              options={[
                { value: true, label: t('deductionTypePercentageOptionV2') },
                { value: false, label: t('deductionTypeFixedAmountOption') },
              ]}
            />
            <NumberInputField
              name="amount"
              adornmentStart={!watchedAmountPercentage && '$'}
              adornmentEnd={watchedAmountPercentage && '%'}
              label={t('deductionAmountLabel')}
              isRequired
              min={0}
              format={watchedAmountPercentage ? 'percent' : 'currency'}
              description={
                watchedAmountPercentage
                  ? t('deductionAmountDescriptionPercentage')
                  : t('deductionAmountDescriptionFixed')
              }
            />
            {watchedRecurring && (
              <>
                <NumberInputField
                  name="totalAmount"
                  adornmentStart="$"
                  format="currency"
                  label={t('totalAmountLabel')}
                  description={t('totalAmountDescription')}
                  min={0}
                />
                <NumberInputField
                  name="annualMaximum"
                  adornmentStart="$"
                  format="currency"
                  label={t('annualMaxLabel')}
                  min={0}
                  description={t('annualMaxDescription')}
                />
              </>
            )}
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

export default GarnishmentForm
