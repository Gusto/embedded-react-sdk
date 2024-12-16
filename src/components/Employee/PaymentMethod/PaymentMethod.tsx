import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useMemo, useState } from 'react'
import { Form } from 'react-aria-components'
import { FormProvider, useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import * as v from 'valibot'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { Actions } from '@/components/Employee/PaymentMethod/Actions'
import {
  BankAccountForm,
  BankAccountSchema,
} from '@/components/Employee/PaymentMethod/BankAccountEdit'
import { BankAccountsList } from '@/components/Employee/PaymentMethod/BankAccountsList'
import { Head } from '@/components/Employee/PaymentMethod/Head'
import {
  PAYMENT_METHODS,
  PaymentTypeForm,
} from '@/components/Employee/PaymentMethod/PaymentTypeForm'
import { Split, SPLIT_BY } from '@/components/Employee/PaymentMethod/Split'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import type { Schemas } from '@/types/schema'
import {
  useAddEmployeeBankAccount,
  useDeleteEmployeeBankAccount,
  useGetEmployeeBankAccounts,
  useGetEmployeePaymentMethod,
  useUpdateEmployeeBankAccount,
  useUpdateEmployeePaymentMethod,
} from '@/api/queries'
import { ApiError } from '@/api/queries/helpers'

interface PaymentMethodProps extends CommonComponentInterface {
  employeeId: string
  defaultValues?: never
}

type PaymentMethodContextType = {
  bankAccounts: Schemas['Employee-Bank-Account'][]
  isPending: boolean
  watchedType?: string
  mode: MODE
  paymentMethod: Schemas['Employee-Payment-Method']
  handleAdd: () => void
  handleSplit: () => void
  handleCancel: () => void
  handleDelete: (uuid: string) => void
}

const [usePaymentMethod, PaymentMethodProvider] =
  createCompoundContext<PaymentMethodContextType>('PaymentMethodContext')
export { usePaymentMethod }

export function PaymentMethod(props: PaymentMethodProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
const CombinedSchema = v.union([
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(false),
    ...BankAccountSchema.entries,
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(false),
    hasBankPayload: v.literal(false),
  }),
  v.object({
    type: v.literal('Check'),
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(true),
    hasBankPayload: v.literal(false),
    split_by: v.literal('Percentage'),
    split_amount: v.pipe(
      v.record(v.string(), v.pipe(v.number(), v.maxValue(100), v.minValue(0))),
      v.check(
        input => Object.values(input).reduce((acc, curr) => acc + curr, 0) === 100,
        'Must be 100',
      ),
    ),
    priority: v.record(v.string(), v.number()),
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(true),
    hasBankPayload: v.literal(false),
    split_by: v.literal('Amount'),
    priority: v.pipe(
      v.record(v.string(), v.number()),
      v.check(input => {
        const arr = Object.values(input)
        return arr.filter((item, index) => arr.indexOf(item) !== index).length === 0
      }),
    ),
    split_amount: v.record(v.string(), v.nullable(v.pipe(v.number(), v.minValue(0)))),
    remainder: v.string(),
  }),
])

export type CombinedSchemaInputs = v.InferInput<typeof CombinedSchema>
export type CombinedSchemaOutputs = v.InferOutput<typeof CombinedSchema>

type MODE = 'ADD' | 'LIST' | 'SPLIT' | 'INITIAL'
const Root = ({ employeeId, className }: PaymentMethodProps) => {
  useI18n('Employee.PaymentMethod')
  const { setError, throwError, onEvent } = useBase()

  const { data: paymentMethod } = useGetEmployeePaymentMethod(employeeId)
  const { data: bankAccounts } = useGetEmployeeBankAccounts(employeeId)
  const paymentMethodMutation = useUpdateEmployeePaymentMethod(employeeId)
  const deleteBankAccountMutation = useDeleteEmployeeBankAccount(employeeId)
  const addBankAccountMutation = useAddEmployeeBankAccount(employeeId)
  const updateBankAccountMutation = useUpdateEmployeeBankAccount(employeeId)

  const [mode, setMode] = useState<MODE>(bankAccounts.length < 1 ? 'INITIAL' : 'LIST')
  if (mode !== 'INITIAL' && bankAccounts.length < 1) {
    setMode('INITIAL')
  }

  const baseDefaultValues: Partial<CombinedSchemaOutputs> = useMemo(() => {
    return {
      type: 'Direct Deposit',
      isSplit: false,
      hasBankPayload: false,
      name: '',
      routing_number: '',
      account_number: '',
      account_type: 'Checking',
      split_by: undefined,
      split_amount: {},
      priority: {},
    } as Partial<CombinedSchemaOutputs>
  }, [])

  const defaultValues: CombinedSchemaOutputs = useMemo(() => {
    return {
      ...baseDefaultValues,
      type: paymentMethod.type ?? 'Direct Deposit',
      split_by: paymentMethod.split_by ?? undefined,
      ...paymentMethod.splits?.reduce(
        (acc, { uuid, split_amount, priority }) => ({
          split_amount: { ...acc.split_amount, [uuid]: split_amount ?? null },
          priority: { ...acc.priority, [uuid]: Number(priority) },
        }),
        { split_amount: {}, priority: {} },
      ),
      remainder:
        paymentMethod.type === 'Direct Deposit' && paymentMethod.splits
          ? paymentMethod.splits.reduce(
              (acc, curr) =>
                curr.split_amount === null
                  ? curr.uuid
                  : (paymentMethod.splits?.at(-1)?.uuid ?? acc),
              '',
            )
          : undefined,
    } as CombinedSchemaOutputs
  }, [baseDefaultValues, paymentMethod.type, paymentMethod.split_by, paymentMethod.splits])

  const formMethods = useForm<CombinedSchemaInputs>({
    resolver: valibotResolver(CombinedSchema),
    defaultValues: defaultValues as DefaultValues<CombinedSchemaInputs>,
  })

  const watchedType = formMethods.watch('type')

  const { reset: resetForm } = formMethods

  useEffect(() => {
    resetForm(defaultValues)
  }, [bankAccounts.length, paymentMethod, defaultValues, resetForm])

  const onSubmit: SubmitHandler<CombinedSchemaInputs> = async data => {
    try {
      const { type } = data
      if (
        type === 'Direct Deposit' &&
        data.hasBankPayload &&
        (mode === 'ADD' || mode === 'INITIAL')
      ) {
        const bankPayload = {
          name: data.name,
          routing_number: data.routing_number,
          account_number: data.account_number,
          account_type: data.account_type,
        }

        const bankAccountResponse = await addBankAccountMutation.mutateAsync({
          body: bankPayload,
        })
        onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, bankAccountResponse)
      } else {
        //Adding bank account updates payment method
        const body =
          type === PAYMENT_METHODS.check
            ? { version: paymentMethod.version as string }
            : {
                ...paymentMethod,
                version: paymentMethod.version as string,
                split_by: data.isSplit
                  ? data.split_by
                  : (paymentMethod.split_by ?? SPLIT_BY.percentage),
                splits:
                  data.isSplit && paymentMethod.splits
                    ? paymentMethod.splits.map(split => ({
                        ...split,
                        split_amount: data.split_amount[split.uuid],
                        priority: data.priority[split.uuid],
                      }))
                    : (paymentMethod.splits ?? []),
              }
        const paymentMethodResponse = await paymentMethodMutation.mutateAsync({
          body: { ...body, type: type },
        })
        onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, paymentMethodResponse)
      }
      //Cleanup after submission bank/split submission
      formMethods.setValue('isSplit', false)
      formMethods.setValue('hasBankPayload', false)
      //Notify that this component is ready to proceed
      if (mode === 'LIST' || type === PAYMENT_METHODS.check) {
        onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
      } else {
        setMode('LIST')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
      } else throwError(err)
    }
  }

  const handleDelete = async (uuid: string) => {
    const data = await deleteBankAccountMutation.mutateAsync(uuid)
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, data)
  }
  // const handleCancel = () => {
  //   onEvent(componentEvents.CANCEL);
  // };
  const handleAdd = () => {
    setMode('ADD')
    resetForm(defaultValues)
  }
  const handleCancel = () => {
    setMode('LIST')
    resetForm(defaultValues)
  }
  const handleSplit = () => {
    setMode('SPLIT')
  }
  return (
    <section className={className}>
      <PaymentMethodProvider
        value={{
          bankAccounts,
          isPending:
            deleteBankAccountMutation.isPending ||
            paymentMethodMutation.isPending ||
            addBankAccountMutation.isPending ||
            updateBankAccountMutation.isPending,
          watchedType,
          mode,
          paymentMethod,
          handleCancel,
          handleAdd,
          handleDelete,
          handleSplit,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Head />
            <PaymentTypeForm />
            <BankAccountsList />
            <BankAccountForm />
            <Split />
            <Actions />
          </Form>
        </FormProvider>
      </PaymentMethodProvider>
    </section>
  )
}

export const PaymentMethodContextual = () => {
  const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'PaymentMethod',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <PaymentMethod employeeId={employeeId} onEvent={onEvent} />
}
