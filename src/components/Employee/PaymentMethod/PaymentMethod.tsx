import { valibotResolver } from '@hookform/resolvers/valibot'
import { type EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import { type EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { useEmployeePaymentMethodCreateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodCreate'
import { useEmployeePaymentMethodDeleteBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodDeleteBankAccount'
import {
  useEmployeePaymentMethodsGetBankAccountsSuspense,
  invalidateAllEmployeePaymentMethodsGetBankAccounts,
} from '@gusto/embedded-api/react-query/employeePaymentMethodsGetBankAccounts'
import {
  useEmployeePaymentMethodGetSuspense,
  invalidateAllEmployeePaymentMethodGet,
} from '@gusto/embedded-api/react-query/employeePaymentMethodGet'
import { useEmployeePaymentMethodUpdateBankAccountMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdateBankAccount'
import { useEmployeePaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodUpdate'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'
import { useFlow } from '@/components/Flow/Flow'

interface PaymentMethodProps extends CommonComponentInterface {
  employeeId: string
  defaultValues?: never
}

type PaymentMethodContextType = {
  bankAccounts: EmployeeBankAccount[]
  isPending: boolean
  watchedType?: string
  mode: MODE
  paymentMethod: EmployeePaymentMethod
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
    splitBy: v.literal('Percentage'),
    splitAmount: v.pipe(
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
    splitBy: v.literal('Amount'),
    priority: v.pipe(
      v.record(v.string(), v.number()),
      v.check(input => {
        const arr = Object.values(input)
        return arr.filter((item, index) => arr.indexOf(item) !== index).length === 0
      }),
    ),
    splitAmount: v.record(v.string(), v.nullable(v.pipe(v.number(), v.minValue(0)))),
    remainder: v.string(),
  }),
])

export type CombinedSchemaInputs = v.InferInput<typeof CombinedSchema>
export type CombinedSchemaOutputs = v.InferOutput<typeof CombinedSchema>

type MODE = 'ADD' | 'LIST' | 'SPLIT' | 'INITIAL'
const Root = ({ employeeId, className }: PaymentMethodProps) => {
  useI18n('Employee.PaymentMethod')
  const { baseSubmitHandler, onEvent } = useBase()
  const queryClient = useQueryClient()

  const {
    data: { employeePaymentMethod },
  } = useEmployeePaymentMethodGetSuspense({ employeeId })
  const paymentMethod = employeePaymentMethod!
  const { data: bankAccountsList } = useEmployeePaymentMethodsGetBankAccountsSuspense({
    employeeId,
  })
  const bankAccounts = bankAccountsList.employeeBankAccountList!
  const paymentMethodMutation = useEmployeePaymentMethodUpdateMutation()
  const deleteBankAccountMutation = useEmployeePaymentMethodDeleteBankAccountMutation()
  const addBankAccountMutation = useEmployeePaymentMethodCreateMutation()
  const updateBankAccountMutation = useEmployeePaymentMethodUpdateBankAccountMutation()

  const invalidateAll = useCallback(async () => {
    await invalidateAllEmployeePaymentMethodGet(queryClient)
    await invalidateAllEmployeePaymentMethodsGetBankAccounts(queryClient)
  }, [queryClient])

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
      routingNumber: '',
      accountNumber: '',
      accountType: 'Checking',
      splitBy: undefined,
      splitAmount: {},
      priority: {},
    } as Partial<CombinedSchemaOutputs>
  }, [])

  const defaultValues: CombinedSchemaOutputs = useMemo(() => {
    return {
      ...baseDefaultValues,
      type: paymentMethod.type ?? 'Direct Deposit',
      splitBy: paymentMethod.splitBy ?? undefined,
      ...paymentMethod.splits?.reduce(
        (acc, { uuid, splitAmount, priority }) => ({
          splitAmount: { ...acc.splitAmount, [uuid]: splitAmount ?? null },
          priority: { ...acc.priority, [uuid]: Number(priority) },
        }),
        { splitAmount: {}, priority: {} },
      ),
      remainder:
        paymentMethod.type === 'Direct Deposit' && paymentMethod.splits
          ? paymentMethod.splits.reduce(
              (acc, curr) =>
                curr.splitAmount === null ? curr.uuid : (paymentMethod.splits?.at(-1)?.uuid ?? acc),
              '',
            )
          : undefined,
    } as CombinedSchemaOutputs
  }, [baseDefaultValues, paymentMethod.type, paymentMethod.splitBy, paymentMethod.splits])

  const formMethods = useForm<CombinedSchemaInputs>({
    resolver: valibotResolver(CombinedSchema),
    defaultValues: defaultValues as DefaultValues<CombinedSchemaInputs>,
  })

  const watchedType = formMethods.watch('type')

  const { reset: resetForm } = formMethods
  const { mutateAsync: mutatePaymentMethod } = paymentMethodMutation

  useEffect(() => {
    void (async () => {
      if (paymentMethod.splits?.length === 1 && paymentMethod.type === 'Direct Deposit') {
        await mutatePaymentMethod({
          request: {
            employeeId,
            requestBody: {
              splitBy: SPLIT_BY.percentage,
              splits: paymentMethod.splits.map(split => ({
                ...split,
                splitAmount: 100,
                priority: 1,
              })),
              version: paymentMethod.version as string,
              type: 'Direct Deposit',
            },
          },
        })
        await invalidateAll()
      }
    })()
  }, [employeeId, invalidateAll, paymentMethod, queryClient, mutatePaymentMethod])

  useEffect(() => {
    resetForm(defaultValues)
  }, [bankAccounts.length, paymentMethod, defaultValues, resetForm])

  const onSubmit: SubmitHandler<CombinedSchemaInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { type } = payload
      if (
        type === 'Direct Deposit' &&
        payload.hasBankPayload &&
        (mode === 'ADD' || mode === 'INITIAL')
      ) {
        const bankAccountResponse = await addBankAccountMutation.mutateAsync({
          request: {
            employeeId,
            requestBody: {
              name: payload.name,
              routingNumber: payload.routingNumber,
              accountNumber: payload.accountNumber,
              accountType: payload.accountType,
            },
          },
        })
        await invalidateAll()

        onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, bankAccountResponse)
      } else {
        //Adding bank account updates payment method
        const body =
          type === PAYMENT_METHODS.check
            ? { version: paymentMethod.version as string }
            : {
                ...paymentMethod,
                version: paymentMethod.version as string,
                splitBy: payload.isSplit
                  ? payload.splitBy
                  : (paymentMethod.splitBy ?? SPLIT_BY.percentage),
                splits:
                  payload.isSplit && paymentMethod.splits
                    ? paymentMethod.splits.map(split => ({
                        ...split,
                        splitAmount: payload.splitAmount[split.uuid],
                        priority: payload.priority[split.uuid],
                      }))
                    : (paymentMethod.splits ?? []),
              }
        const paymentMethodResponse = await paymentMethodMutation.mutateAsync({
          request: { employeeId, requestBody: { ...body, type } },
        })
        await invalidateAll()
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
    })
  }

  const handleDelete = async (uuid: string) => {
    const data = await deleteBankAccountMutation.mutateAsync({
      request: { employeeId, bankAccountUuid: uuid },
    })
    await invalidateAll()
    onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED, data)
  }
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
