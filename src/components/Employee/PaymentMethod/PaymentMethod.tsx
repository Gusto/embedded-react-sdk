import { zodResolver } from '@hookform/resolvers/zod'
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
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import {
  CombinedSchema,
  type CombinedSchemaInputs,
  type CombinedSchemaOutputs,
  type MODE,
  PaymentMethodProvider,
} from './usePaymentMethod'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { Actions } from '@/components/Employee/PaymentMethod/Actions'
import { BankAccountForm } from '@/components/Employee/PaymentMethod/BankAccountEdit'
import { BankAccountsList } from '@/components/Employee/PaymentMethod/BankAccountsList'
import { Head } from '@/components/Employee/PaymentMethod/Head'
import { PaymentTypeForm } from '@/components/Employee/PaymentMethod/PaymentTypeForm'
import { Split } from '@/components/Employee/PaymentMethod/Split'
import { useI18n } from '@/i18n'
import { componentEvents, PAYMENT_METHODS, SPLIT_BY } from '@/shared/constants'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentDictionary } from '@/i18n/I18n'

interface PaymentMethodProps extends CommonComponentInterface<'Employee.PaymentMethod'> {
  employeeId: string
  defaultValues?: never
}

export function PaymentMethod(props: PaymentMethodProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, className, dictionary }: PaymentMethodProps) => {
  useI18n('Employee.PaymentMethod')
  useComponentDictionary('Employee.PaymentMethod', dictionary)
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
    resolver: zodResolver(CombinedSchema),
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
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()
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
