import { useMemo, useState } from 'react'
import {
  useContractorPaymentMethodGetSuspense,
  buildContractorPaymentMethodGetQuery,
} from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import {
  PaymentMethodForm,
  type PaymentMethodFormValues,
} from '../../components/contractor/shared/PaymentMethodForm/PaymentMethodForm'
import { BaseComponent, useBase } from '@/components/Base'
import { componentEvents, PAYMENT_METHODS } from '@/shared/constants'

interface ContractorSelfPaymentMethodFormProps {
  contractorId: string
  onEvent: (...args: unknown[]) => void
}

export function ContractorSelfPaymentMethodForm(props: ContractorSelfPaymentMethodFormProps) {
  return (
    <BaseComponent onEvent={props.onEvent}>
      <Root contractorId={props.contractorId} />
    </BaseComponent>
  )
}

function Root({ contractorId }: { contractorId: string }) {
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const [isRefetching, setIsRefetching] = useState(false)

  const {
    data: { contractorPaymentMethod: paymentMethod },
  } = useContractorPaymentMethodGetSuspense({ contractorUuid: contractorId })

  const {
    data: { contractorBankAccountList },
  } = useContractorPaymentMethodGetBankAccountsSuspense({ contractorUuid: contractorId })
  const bankAccount = contractorBankAccountList?.[0]

  const { mutateAsync: createBankAccount, isPending: bankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()
  const { mutateAsync: updatePaymentMethod, isPending: paymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()

  const defaultValues = useMemo(
    () => ({
      type: paymentMethod!.type || PAYMENT_METHODS.check,
      name: bankAccount?.name || '',
      routingNumber: bankAccount?.routingNumber || '',
      accountNumber: bankAccount?.hiddenAccountNumber || '',
      accountType: bankAccount?.accountType || 'Checking',
    }),
    [paymentMethod, bankAccount],
  )

  const handleSubmit = async (data: PaymentMethodFormValues) => {
    await baseSubmitHandler(data, async payload => {
      let updatedPaymentMethodVersion: string | undefined

      if (payload.type === PAYMENT_METHODS.directDeposit) {
        const { name, routingNumber, accountNumber, accountType } = payload
        const hasChanged =
          !bankAccount ||
          name !== bankAccount.name ||
          routingNumber !== bankAccount.routingNumber ||
          accountType !== bankAccount.accountType ||
          accountNumber !== bankAccount.hiddenAccountNumber

        if (hasChanged) {
          const bankAccountResponse = await createBankAccount({
            request: {
              contractorUuid: contractorId,
              contractorBankAccountCreateRequestBody: {
                name,
                routingNumber,
                accountNumber,
                accountType,
              },
            },
          })
          onEvent(componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED, bankAccountResponse)

          setIsRefetching(true)
          const refetched = await queryClient.fetchQuery(
            buildContractorPaymentMethodGetQuery(gustoClient, { contractorUuid: contractorId }),
          )
          setIsRefetching(false)
          updatedPaymentMethodVersion = refetched.contractorPaymentMethod!.version as string
        }
      }

      const paymentMethodResponse = await updatePaymentMethod({
        request: {
          contractorUuid: contractorId,
          requestBody: {
            type: payload.type,
            version: updatedPaymentMethodVersion ?? (paymentMethod!.version as string),
          },
        },
      })
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED, paymentMethodResponse)
      onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE, {
        contractorId,
        selfOnboarding: true,
      })
    })
  }

  return (
    <PaymentMethodForm
      heading="Set up your payment method"
      description="Choose how you'd like to get paid."
      defaultValues={defaultValues}
      isPending={bankAccountPending || paymentMethodPending || isRefetching}
      onSubmit={handleSubmit}
    />
  )
}
