import { Form } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import * as v from 'valibot'
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  useGarnishmentsListSuspense,
  invalidateGarnishmentsList,
} from '@gusto/embedded-api/react-query/garnishmentsList'
import { type Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { useGarnishmentsCreateMutation } from '@gusto/embedded-api/react-query/garnishmentsCreate'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Actions } from '@/components/Employee/Deductions/Actions'
import { IncludeDeductionsForm } from '@/components/Employee/Deductions/IncludeDuductionsForm'
import { Head } from '@/components/Employee/Deductions/Head'
import { DeductionForm } from '@/components/Employee/Deductions/DeductionForm'
import { DeductionsList } from '@/components/Employee/Deductions/DeductionsList'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'
import { useFlow } from '@/components/Flow/Flow'
interface DeductionsProps extends CommonComponentInterface {
  employeeId: string
}
type MODE = 'ADD' | 'LIST' | 'INITIAL' | 'EDIT'
type DeductionsContextType = {
  isPending: boolean
  deductions: Garnishment[]
  employeeId: string
  mode: MODE
  handleAdd: () => void
  handleCancel: () => void
  handleEdit: (deduction: Garnishment) => void
  handleDelete: (deduction: Garnishment) => void
  handlePassthrough: () => void
}
const [useDeductions, DeductionsProvider] =
  createCompoundContext<DeductionsContextType>('DeductionsContext')
export { useDeductions }

const DeductionSchema = v.object({
  active: v.boolean(),
  amount: v.pipe(v.number(), v.minValue(0), v.transform(String)),
  description: v.pipe(v.string(), v.nonEmpty()),
  courtOrdered: v.boolean(),
  times: v.nullable(v.number()), //The number of times to apply the garnishment. Ignored if recurring is true.
  recurring: v.pipe(
    v.string(),
    v.transform(val => val === 'true'),
  ),
  annualMaximum: v.nullable(
    v.pipe(
      v.number(),
      v.minValue(0),
      v.transform(val => (val > 0 ? val.toString() : null)),
    ),
  ),
  payPeriodMaximum: v.nullable(
    v.pipe(
      v.number(),
      v.minValue(0),
      v.transform(val => (val > 0 ? val.toString() : null)),
    ),
  ),
  deductAsPercentage: v.pipe(
    v.string(),
    v.transform(val => val === 'true'),
  ),
})

export type DeductionInputs = v.InferInput<typeof DeductionSchema>
export type DeductionPayload = v.InferOutput<typeof DeductionSchema>

const IncludeDeductionsSchema = v.object({ includeDeductions: v.picklist(['Yes', 'No']) })
export type IncludeDeductionsPayload = v.InferOutput<typeof IncludeDeductionsSchema>

export function Deductions(props: DeductionsProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
export const Root = ({ employeeId, className }: DeductionsProps) => {
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const { data } = useGarnishmentsListSuspense({ employeeId })
  const deductions = data.garnishmentList!

  // Used for deletion or edit of deduction
  const { mutateAsync: updateDeduction, isPending: isPendingUpdate } =
    useGarnishmentsUpdateMutation({
      onSettled: () => invalidateGarnishmentsList(queryClient, [employeeId]),
    })
  const { mutateAsync: createDeduction, isPending: isPendingCreate } =
    useGarnishmentsCreateMutation({
      onSettled: () => invalidateGarnishmentsList(queryClient, [employeeId]),
    })

  const activeDeductions = deductions.filter(deduction => deduction.active)
  const [mode, setMode] = useState<MODE>(activeDeductions.length < 1 ? 'INITIAL' : 'LIST')
  const [currentDeduction, setCurrentDeduction] = useState<Garnishment | null>(null)
  useI18n('Employee.Deductions')

  const defaultValues: DeductionInputs = useMemo(() => {
    return {
      amount: currentDeduction?.amount ? Number(currentDeduction.amount) : 0,
      description: currentDeduction?.description ?? '',
      times: currentDeduction?.times ?? null,
      recurring: currentDeduction?.recurring?.toString() ?? 'true',
      annualMaximum: currentDeduction?.annualMaximum
        ? Number(currentDeduction.annualMaximum)
        : null,
      payPeriodMaximum: currentDeduction?.payPeriodMaximum
        ? Number(currentDeduction.payPeriodMaximum)
        : null,
      deductAsPercentage: currentDeduction?.deductAsPercentage?.toString() ?? 'true',
      active: true,
      courtOrdered: currentDeduction?.courtOrdered ?? false,
    } as DeductionInputs
  }, [currentDeduction])

  const includeDeductionsFormMethods = useForm<IncludeDeductionsPayload>({
    // resolver: valibotResolver(IncludeDeductionsSchema),
    defaultValues: { includeDeductions: 'No' },
  })

  const formMethods = useForm<DeductionInputs, unknown, DeductionPayload>({
    resolver: valibotResolver(DeductionSchema),
    defaultValues,
  })

  const { reset: resetForm } = formMethods

  useEffect(() => {
    resetForm(defaultValues)
  }, [currentDeduction, defaultValues, resetForm, mode])

  const handleDelete = async (deduction: Garnishment) => {
    await baseSubmitHandler(deduction, async payload => {
      //Deletion of deduction is simply updating it with active: false
      const { garnishment } = await updateDeduction({
        request: {
          garnishmentId: payload.uuid,
          requestBody: {
            ...payload,
            totalAmount: payload.totalAmount ?? undefined,
            active: false,
            version: payload.version as string,
          },
        },
      })
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED, garnishment)
    })
  }
  const onSubmit: SubmitHandler<DeductionPayload | IncludeDeductionsPayload> = async data => {
    await baseSubmitHandler(data, async payload => {
      if ('includeDeductions' in payload) {
        if (payload.includeDeductions === 'Yes') {
          setMode('ADD')
          onEvent(componentEvents.EMPLOYEE_DEDUCTION_ADD)
        } else {
          onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
          return
        }
      }
      if (!('includeDeductions' in payload)) {
        if (mode === 'ADD') {
          const { garnishment: createDeductionResponse } = await createDeduction({
            request: {
              employeeId: employeeId,
              requestBody: { ...payload, times: payload.recurring ? null : 1 },
            },
          })
          onEvent(componentEvents.EMPLOYEE_DEDUCTION_CREATED, createDeductionResponse)
        } else if (mode === 'EDIT') {
          const { garnishment: updateDeductionResponse } = await updateDeduction({
            request: {
              garnishmentId: currentDeduction?.uuid ?? '',
              requestBody: {
                ...payload,
                version: currentDeduction?.version as string,
                times: payload.recurring ? null : 1,
              },
            },
          })
          onEvent(componentEvents.EMPLOYEE_DEDUCTION_UPDATED, updateDeductionResponse)
          setCurrentDeduction(null)
        }
        setMode('LIST')
      }
    })
  }
  const handleAdd = () => {
    setMode('ADD')
  }
  const handleCancel = () => {
    setMode('LIST')
    setCurrentDeduction(null)
  }
  const handleEdit = (deduction: Garnishment) => {
    setMode('EDIT')
    setCurrentDeduction(deduction)
  }
  const handlePassthrough = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
  }
  return (
    <section className={className}>
      <DeductionsProvider
        value={{
          isPending: isPendingCreate || isPendingUpdate,
          employeeId,
          mode,
          deductions,
          handleAdd,
          handleCancel,
          handleDelete,
          handleEdit,
          handlePassthrough,
        }}
      >
        {mode === 'INITIAL' ? (
          <FormProvider {...includeDeductionsFormMethods}>
            <Form onSubmit={includeDeductionsFormMethods.handleSubmit(onSubmit)}>
              <Head />
              <IncludeDeductionsForm />
              <Actions />
            </Form>
          </FormProvider>
        ) : (
          <FormProvider {...formMethods}>
            <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <Head />
              <DeductionsList />
              <DeductionForm />
              <Actions />
            </Form>
          </FormProvider>
        )}
      </DeductionsProvider>
    </section>
  )
}

export const DeductionsContextual = () => {
  const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Deductions',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <Deductions employeeId={employeeId} onEvent={onEvent} />
}
