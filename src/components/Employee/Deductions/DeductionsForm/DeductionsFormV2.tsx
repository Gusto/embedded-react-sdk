import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { FormProvider, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { useGarnishmentsGetChildSupportDataSuspense } from '@gusto/embedded-api/react-query/garnishmentsGetChildSupportData'
import type { GarnishmentType } from '@gusto/embedded-api/models/operations/postv1employeesemployeeidgarnishments'
import { PaymentPeriod } from '@gusto/embedded-api/models/components/garnishmentchildsupport'
import styles from './DeductionsForm.module.scss'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout, Grid } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import {
  CheckboxField,
  NumberInputField,
  RadioGroupField,
  TextInputField,
  SelectField,
} from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'
import CaretLeft from '@/assets/icons/caret-left.svg?react'

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

interface DeductionsFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
  deductionId?: string | null
}

export function DeductionsFormV2(props: DeductionsFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, employeeId, deductionId, dictionary }: DeductionsFormProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  // Fetch all garnishments to find the specific one by ID
  const { data } = useGarnishmentsListSuspense({ employeeId })

  // Fetch child support metadata
  const { data: childSupportData } = useGarnishmentsGetChildSupportDataSuspense({})

  // find existing deduction/garnishment to determine if in ADD or EDIT mode
  // if deduction exists we are editing, else we are adding
  // edit deductions cannot change the type, it can only update the existing entries of the record
  const deduction = deductionId
    ? (data.garnishmentList?.find(g => g.uuid === deductionId) ?? null)
    : null
  const title = !deduction ? t('addDeductionTitle') : t('editDeductionTitle')
  const deductionType = deduction?.garnishmentType
  const csAgencies =
    childSupportData.childSupportData?.agencies?.map(a => ({
      label: a.name as string,
      value: a.state as string,
    })) || []

  // if deduction exists check if it has a type, else if does not exist default to child support
  const [isChildSupport, setIsChildSupport] = useState<boolean>(
    deductionType === 'child_support' || !deduction,
  )
  const defaultDeductionTypeSelection = deduction
    ? deductionType
      ? 'garnishment'
      : 'custom'
    : 'garnishment'

  // filter out specific fipsCodes/counties as mapped to selected state agency
  // some states only have 1 fips code/county to cover the entire state,
  // but the API will return a null label so we need to provide a default
  const [stateAgency, setStateAgency] = useState<string>(deduction?.childSupport?.state || '')
  const handleStateAgencySelect = (stateAgency: string) => {
    setStateAgency(stateAgency)
  }
  const counties =
    childSupportData.childSupportData?.agencies
      ?.find(agency => agency.state === stateAgency)
      ?.fipsCodes?.map(fipsCode => ({
        label: fipsCode.county?.length ? fipsCode.county : t('allCounties'),
        value: fipsCode.code,
      })) || []

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

  const handleSelectDeductionType = (selection: string) => {
    const isChildSupport = selection === 'garnishment'
    setIsChildSupport(isChildSupport)
  }

  const paymentPeriodOptions = [
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
  ]

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

  const csFormMethods = useForm<ChildSupportInputs, unknown, ChildSupportPayload>({
    resolver: zodResolver(ChildSupportSchema),
    defaultValues: defaultChildSupportValues,
  })
  const { reset: resetChildSupportForm } = csFormMethods

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
        payPeriodMaximum: payload.payPeriodMaximum,
        description: `Child Support - ${childSupport.caseNumber}`, // cs prefixes type followed by case number
        courtOrdered: true,
        garnishmentType: 'child_support' as GarnishmentType,
        times: null,
        recurring: true,
        deductAsPercentage: true, // child support must deduct as percentage
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
    <section className={className}>
      <Components.Button variant="secondary" onClick={handleCancel}>
        <CaretLeft className={styles.leftCaretIcon} />
        {t('backToDeductionsCta')}
      </Components.Button>
      <Grid gap={16} className={styles.formHeadingContainer}>
        <Components.Heading as="h2">{title}</Components.Heading>
        <section>
          <Components.Text weight="bold">{t('externalPostTaxDeductions')}</Components.Text>
          <Components.Text variant="supporting">
            {t('externalPostTaxDeductionsDescription')}
          </Components.Text>
        </section>
        <Components.RadioGroup
          label={t('deductionTypeLabel')}
          description={t('deductionTypeRadioLabel')}
          options={[
            { value: 'garnishment', label: t('garnishmentOption') },
            { value: 'custom', label: t('customDeductionOption') },
          ]}
          defaultValue={defaultDeductionTypeSelection}
          onChange={handleSelectDeductionType}
          isRequired
          isDisabled={!!deduction}
          className={styles.deductionTypeRadioGroup}
        />
        {/* currently the only garnishment we support is child support */}
        {isChildSupport && (
          <section>
            <Components.Text weight="bold" className={styles.garnishmentTypeLabel}>
              {t('garnishmentType')}
            </Components.Text>
            <Components.Select
              label={t('garnishmentType')}
              options={[]}
              placeholder={t('childSupport')}
              shouldVisuallyHideLabel
              isDisabled
            />
          </section>
        )}
        <hr />
      </Grid>

      {isChildSupport ? (
        <FormProvider {...csFormMethods}>
          <Form onSubmit={csFormMethods.handleSubmit(onChildSupportSubmit)}>
            <Flex flexDirection="column" gap={32}>
              <SelectField
                name="state"
                label={t('agency')}
                description={t('agencyHelperText')}
                options={csAgencies}
                onChange={handleStateAgencySelect}
                isRequired
              />
              {stateAgency && (
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
                    options={paymentPeriodOptions}
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
      ) : (
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
      )}
    </section>
  )
}
