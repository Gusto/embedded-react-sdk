import { useTranslation } from 'react-i18next'
import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { FormProvider, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import {
  CheckboxField,
  NumberInputField,
  RadioGroupField,
  TextInputField,
} from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'

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

interface DeductionsFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
  deductionId?: string | null
}

export function DeductionsForm(props: DeductionsFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, children, employeeId, deductionId, dictionary }: DeductionsFormProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  // Fetch all garnishments to find the specific one by ID
  const { data } = useGarnishmentsListSuspense({ employeeId })
  const deduction = deductionId
    ? (data.garnishmentList?.find(g => g.uuid === deductionId) ?? null)
    : null

  const { mutateAsync: createDeduction, isPending: isPendingCreate } =
    useGarnishmentsCreateMutation()
  const { mutateAsync: updateDeduction, isPending: isPendingUpdate } =
    useGarnishmentsUpdateMutation()

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

  const isPending = isPendingCreate || isPendingUpdate

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

  const title = !deduction ? t('addDeductionTitle') : t('editDeductionTitle')

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex flexDirection="column" gap={32}>
            {children ? (
              children
            ) : (
              <>
                <Components.Heading as="h2">{title}</Components.Heading>
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
                <NumberInputField
                  name="amount"
                  label={t('deductionAmountLabel')}
                  isRequired
                  min={0}
                />
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
                <CheckboxField name="courtOrdered" label={t('courtOrderedLabel')} />
                <ActionsLayout>
                  <Components.Button variant="secondary" onClick={handleCancel}>
                    {t('cancelCta')}
                  </Components.Button>
                  <Components.Button type="submit" isLoading={isPending}>
                    {!deduction ? t('addDeductionCta') : t('continueCta')}
                  </Components.Button>
                </ActionsLayout>
              </>
            )}
          </Flex>
        </Form>
      </FormProvider>
    </section>
  )
}
