import { useTranslation } from 'react-i18next'
import { FormProvider, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PaymentPeriod } from '@gusto/embedded-api/models/components/garnishmentchildsupport'
import type { GarnishmentType } from '@gusto/embedded-api/models/operations/postv1employeesemployeeidgarnishments'
import { type Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { NumberInputField, TextInputField, SelectField } from '@/components/Common'
import { type CommonComponentInterface, useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

const ChildSupportPaymentPeriodSchema = z.nativeEnum(PaymentPeriod)
const ChildSupportSchema = z.object({
  state: z.string(),
  fipsCode: z.string(),
  caseNumber: z.string(),
  amount: z.number().min(0).transform(String),
  payPeriodMaximum: z
    .number()
    .min(0)
    .transform(val => (val > 0 ? val.toString() : null))
    .nullable(),
  paymentPeriod: ChildSupportPaymentPeriodSchema,
})

export type ChildSupportInputs = z.input<typeof ChildSupportSchema>
export type ChildSupportPayload = z.output<typeof ChildSupportSchema>

interface ChildSupportFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
  deduction?: Garnishment | null
  handleStateAgencySelect: (stateAgency: string) => void
  csAgencies: { label: string; value: string }[]
  counties: { label: string; value: string }[]
}

function ChildSupportForm({
  deduction,
  handleStateAgencySelect,
  csAgencies,
  counties,
  employeeId,
}: ChildSupportFormProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  const { mutateAsync: createDeduction, isPending: isPendingCreate } =
    useGarnishmentsCreateMutation()
  const { mutateAsync: updateDeduction, isPending: isPendingUpdate } =
    useGarnishmentsUpdateMutation()
  const isPending = isPendingCreate || isPendingUpdate

  const defaultChildSupportValues: ChildSupportInputs = useMemo(() => {
    return {
      amount: deduction?.amount ? Number(deduction.amount) : 0,
      payPeriodMaximum: deduction?.payPeriodMaximum ? Number(deduction.payPeriodMaximum) : null,
      state: deduction?.childSupport?.state || '',
      fipsCode: deduction?.childSupport?.fipsCode || '',
      caseNumber: deduction?.childSupport?.caseNumber || '',
      paymentPeriod: deduction?.childSupport?.paymentPeriod as PaymentPeriod,
    }
  }, [deduction])

  const childSupportFormMethods = useForm<ChildSupportInputs, unknown, ChildSupportPayload>({
    resolver: zodResolver(ChildSupportSchema),
    defaultValues: defaultChildSupportValues,
  })
  const { reset: resetChildSupportForm, control } = childSupportFormMethods
  const watchedStateAgency = useWatch({ control, name: 'state' })

  useEffect(() => {
    resetChildSupportForm(defaultChildSupportValues)
  }, [deduction, defaultChildSupportValues, resetChildSupportForm])

  const onChildSupportSubmit: SubmitHandler<ChildSupportPayload> = async data => {
    const childSupport = {
      state: data.state,
      paymentPeriod: data.paymentPeriod,
      fipsCode: data.fipsCode,
      caseNumber: data.caseNumber,
    }

    await baseSubmitHandler(data, async payload => {
      const requestBody = {
        active: true,
        amount: payload.amount,
        description: `Child Support - ${childSupport.caseNumber}`, // child support description follows prefix type + case number convention
        courtOrdered: true,
        garnishmentType: 'child_support' as GarnishmentType,
        times: null,
        deductAsPercentage: true, // child support must always deduct as percentage up to a pay period maximum limit and is recurring until cancelled
        payPeriodMaximum: payload.payPeriodMaximum,
        recurring: true,
        childSupport,
      }

      if (!deduction) {
        const { garnishment: createDeductionResponse } = await createDeduction({
          request: {
            employeeId,
            requestBody,
          },
        })
        onEvent(componentEvents.EMPLOYEE_DEDUCTION_CREATED, createDeductionResponse)
      } else {
        const { garnishment: updateDeductionResponse } = await updateDeduction({
          request: {
            garnishmentId: deduction.uuid,
            requestBody: {
              ...requestBody,
              version: deduction.version as string,
            },
          },
        })
        onEvent(componentEvents.EMPLOYEE_DEDUCTION_UPDATED, updateDeductionResponse)
      }
    })
  }

  return (
    <FormProvider {...childSupportFormMethods}>
      <Form onSubmit={childSupportFormMethods.handleSubmit(onChildSupportSubmit)}>
        <Flex flexDirection="column" gap={32}>
          <SelectField
            name="state"
            label={t('agency')}
            description={t('agencyHelperText')}
            options={csAgencies}
            onChange={handleStateAgencySelect}
            isRequired
          />
          {watchedStateAgency && (
            <>
              <SelectField
                name="fipsCode"
                label={t('county')}
                description={t('countyHelperText')}
                options={counties}
                isRequired
              />
              <TextInputField
                name="caseNumber"
                label={t('caseNumber')}
                description={t('caseNumberHelperText')}
                isRequired
              />
              <NumberInputField
                name="payPeriodMaximum"
                label={t('totalAmountWithheld')}
                description={t('totalAmountWithheldHelperText')}
                min={0}
                adornmentStart="$"
                isRequired
              />
              <NumberInputField
                name="amount"
                label={t('maxPaycheckPercentage')}
                description={t('maxPaycheckPercentageHelperText')}
                isRequired
                min={0}
                max={100}
                adornmentStart="%"
              />
              <SelectField
                name="paymentPeriod"
                label={t('per')}
                description={t('perHelperText')}
                options={[
                  {
                    label: t('everyWeek'),
                    value: 'Every week',
                  },
                  {
                    label: t('everyOtherWeek'),
                    value: 'Every other week',
                  },
                  {
                    label: t('twicePerMonth'),
                    value: 'Twice per month',
                  },
                  {
                    label: t('monthly'),
                    value: 'Monthly',
                  },
                ]}
                isRequired
              />
              <ActionsLayout>
                <Components.Button type="submit" isLoading={isPending}>
                  {t('saveCta')}
                </Components.Button>
              </ActionsLayout>
            </>
          )}
        </Flex>
      </Form>
    </FormProvider>
  )
}

export default ChildSupportForm
