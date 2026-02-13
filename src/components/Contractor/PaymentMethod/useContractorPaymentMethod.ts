import type { SubmitHandler } from 'react-hook-form'
import { useForm, useWatch } from 'react-hook-form'
import { useContractorPaymentMethodGetSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useMemo, useState } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import { useQueryClient } from '@tanstack/react-query'
import { buildContractorPaymentMethodGetQuery } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useBase } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType, componentEvents, PAYMENT_METHODS } from '@/shared/constants'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'

const PaymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Direct Deposit'),
    name: z.string().min(1),
    routingNumber: routingNumberValidation,
    accountNumber: z.any(),
    accountType: z.enum(['Checking', 'Savings']),
  }),
  z.object({
    type: z.literal('Check'),
  }),
])

export type PaymentMethodSchemaInputs = z.input<typeof PaymentMethodSchema>
export type PaymentMethodSchemaOutputs = z.output<typeof PaymentMethodSchema>

export interface UseContractorPaymentMethodProps {
  contractorId: string
  onEvent?: OnEventType<EventType, unknown>
}

export function useContractorPaymentMethod({ contractorId }: UseContractorPaymentMethodProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const [isPaymentMethodPending, setIsPaymentMethodPending] = useState(false)

  const contractorPaymentMethod = useContractorPaymentMethodGetSuspense({
    contractorUuid: contractorId,
  })

  const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
    contractorUuid: contractorId,
  })

  const paymentMethod = contractorPaymentMethod.data.contractorPaymentMethod!

  const {
    data: { contractorBankAccountList },
  } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractorId,
  })
  const bankAccount = contractorBankAccountList?.[0] || undefined

  const { mutateAsync: updatePaymentMethod, isPending: paymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: bankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  const defaultValues = useMemo(
    () => ({
      type: paymentMethod.type || PAYMENT_METHODS.check,
      name: bankAccount?.name || '',
      routingNumber: bankAccount?.routingNumber || '',
      accountNumber: bankAccount?.hiddenAccountNumber || '',
      accountType: bankAccount?.accountType || 'Checking',
    }),
    [paymentMethod, bankAccount],
  )

  const formMethods = useForm({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: defaultValues,
  })

  const watchedType = useWatch({ control: formMethods.control, name: 'type' })

  const onSubmit: SubmitHandler<PaymentMethodSchemaInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      let updatedPaymentMethodVersion: string | undefined
      if (payload.type === PAYMENT_METHODS.directDeposit) {
        const { name, accountNumber, routingNumber, accountType } = payload
        if (
          name !== bankAccount?.name ||
          routingNumber !== bankAccount.routingNumber ||
          accountType !== bankAccount.accountType ||
          accountNumber !== bankAccount.hiddenAccountNumber
        ) {
          const res = accountNumberValidation.safeParse(payload.accountNumber)
          if (!res.success) {
            formMethods.setError('accountNumber', { type: 'validate' })
            return
          }
        }

        const bankAccountResponse = await createBankAccount({
          request: {
            contractorUuid: contractorId,
            requestBody: {
              name,
              routingNumber,
              accountNumber,
              accountType,
            },
          },
        })

        onEvent(componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED, bankAccountResponse)

        setIsPaymentMethodPending(true)
        const updatedPaymentMethodResponse = await queryClient.fetchQuery(getPaymentMethodQuery)
        const updatedPaymentMethod = updatedPaymentMethodResponse.contractorPaymentMethod!
        setIsPaymentMethodPending(false)

        updatedPaymentMethodVersion = updatedPaymentMethod.version as string
      }

      const paymentMethodResponse = await updatePaymentMethod({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            type: payload.type,
            version: updatedPaymentMethodVersion || (paymentMethod.version as string),
          },
        },
      })
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED, paymentMethodResponse)
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    })
  }

  const showBankAccountForm = watchedType === PAYMENT_METHODS.directDeposit

  return {
    data: {
      paymentMethod,
      bankAccount,
      showBankAccountForm,
      defaultValues,
    },
    actions: {
      onSubmit,
    },
    meta: {
      isPending: paymentMethodPending || bankAccountPending || isPaymentMethodPending,
    },
    form: {
      formMethods,
      watchedType,
    },
  }
}
