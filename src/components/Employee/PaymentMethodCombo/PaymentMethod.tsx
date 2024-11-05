import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { Form } from 'react-aria-components'
import {
  FormProvider,
  useForm,
  useWatch,
  type DefaultValues,
  type SubmitHandler,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import * as v from 'valibot'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { Actions } from '@/components/Employee/PaymentMethodCombo/Actions'
import {
  BankAccountForm,
  BankAccountSchema,
} from '@/components/Employee/PaymentMethodCombo/BankAccountEdit'
import { BankAccountsList } from '@/components/Employee/PaymentMethodCombo/BankAccountsList'
import { Head } from '@/components/Employee/PaymentMethodCombo/Head'
import {
  PAYMENT_METHODS,
  PaymentTypeForm,
} from '@/components/Employee/PaymentMethodCombo/PaymentTypeForm'
import { Split, SplitSchema } from '@/components/Employee/PaymentMethodCombo/Split'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import type { Schemas } from '@/types'
import {
  useAddEmployeeBankAccount,
  useDeleteEmployeeBankAccount,
  useGetEmployeeBankAccounts,
  useGetEmployeePaymentMethod,
  useUpdateEmployeeBankAccount,
  useUpdateEmployeePaymentMethod,
} from '@/api/queries'

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
const CombinedSchema = v.variant('isSplit', [
  v.variant('type', [
    v.variant('hasBankPayload', [
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
    ]),
    v.object({
      type: v.literal('Check'),
      isSplit: v.literal(false),
      hasBankPayload: v.literal(false),
    }),
  ]),
  SplitSchema,
])

export type CombinedSchemaInputs = v.InferInput<typeof CombinedSchema>

type MODE = 'ADD' | 'LIST' | 'SPLIT' | 'INITIAL'
export const Root = ({ employeeId, className }: PaymentMethodProps) => {
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

  const defaultValues: DefaultValues<CombinedSchemaInputs> = {
    type: paymentMethod.type ?? 'Direct Deposit',
    isSplit: false,
    hasBankPayload: false,
    name: '',
    routing_number: '',
    account_number: '',
    account_type: 'Checking',
    split_by: paymentMethod.split_by,
    ...paymentMethod.splits?.reduce(
      (acc, { uuid, split_amount, priority }) => ({
        split_amount: { ...acc.split_amount, [uuid]: Number(split_amount ?? '') },
        priority: { ...acc.priority, [uuid]: Number(priority) },
      }),
      { split_amount: {}, priority: {} },
    ),
    //Remainder is either a split with no split_amount, or the last split in the group
    remainder: paymentMethod.splits?.reduce(
      (acc, curr) => (curr.split_amount === null ? curr.uuid : paymentMethod.splits?.at(-1)?.uuid),
      undefined,
    ),
  }
  const formMethods = useForm<CombinedSchemaInputs>({
    resolver: valibotResolver(CombinedSchema),
    defaultValues,
  })
  const watchedType = formMethods.watch('type')
  useEffect(() => {
    formMethods.reset(defaultValues)
  }, [bankAccounts.length, paymentMethod])

  function hasBankPayload(
    data: CombinedSchemaInputs,
  ): data is CombinedSchemaInputs & { hasBankPayload: true } {
    return 'hasBankPayload' in data && data.hasBankPayload
  }
  // console.log(formMethods.formState);
  const onSubmit: SubmitHandler<CombinedSchemaInputs> = async data => {
    console.log(data)
    // console.log(v.parse(CombinedSchema, data));
    return
    try {
      const { type, ...bankPayload } = data
      if (hasBankPayload(data) && (mode === 'ADD' || mode === 'INITIAL')) {
        const bankAccountResponse = await addBankAccountMutation.mutateAsync({
          body: bankPayload,
        })
        onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, bankAccountResponse)
        setMode('LIST')
      } else {
        //Adding bank account updates payment method
        const body =
          type === PAYMENT_METHODS.check
            ? { version: paymentMethod.version as string }
            : {
                ...paymentMethod,
                version: paymentMethod.version as string,
                split_by: paymentMethod.split_by ?? SPLIT_BY.percentage,
                splits: paymentMethod.splits ?? [],
              }
        const paymentMethodResponse = await paymentMethodMutation.mutateAsync({
          body: { ...body, type: type },
        })
        onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, paymentMethodResponse)
      }
      //Notify that his component is ready to proceed
      if (mode === 'LIST' || type === PAYMENT_METHODS.check) {
        onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
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
    formMethods.reset(defaultValues)
  }
  const handleCancel = () => {
    setMode('LIST')
    formMethods.reset(defaultValues)
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
