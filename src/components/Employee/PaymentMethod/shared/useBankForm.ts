import { useEmployeePaymentMethodCreateMutation } from '@gusto/embedded-api/react-query/employeePaymentMethodCreate'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type DefaultValues, type SubmitHandler } from 'react-hook-form'
import { CombinedSchema, type CombinedSchemaInputs } from './paymentMethodSchema'
import { useBase, type OnEventType } from '@/components/Base/useBase'
import { componentEvents, type EventType } from '@/shared/constants'

export interface UseBankFormParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UseBankFormResult {
  formMethods: ReturnType<typeof useForm<CombinedSchemaInputs>>
  isPending: boolean
  handleBankAccountSubmit: SubmitHandler<CombinedSchemaInputs>
  resetToDefaults: () => void
}

const defaultFormValues = {
  type: 'Direct Deposit' as const,
  isSplit: false as const,
  hasBankPayload: false as const,
  accountType: 'Checking' as const,
}

export function useBankForm({ employeeId, onEvent }: UseBankFormParams): UseBankFormResult {
  const { baseSubmitHandler } = useBase()
  const addBankAccountMutation = useEmployeePaymentMethodCreateMutation()

  const formMethods = useForm<CombinedSchemaInputs>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: defaultFormValues as DefaultValues<CombinedSchemaInputs>,
  })

  const handleBankAccountSubmit: SubmitHandler<CombinedSchemaInputs> = async payload => {
    if (
      payload.type !== 'Direct Deposit' ||
      !('hasBankPayload' in payload) ||
      !payload.hasBankPayload
    )
      return

    const { name, routingNumber, accountNumber, accountType } = payload
    await baseSubmitHandler(payload, async () => {
      const response = await addBankAccountMutation.mutateAsync({
        request: {
          employeeId,
          employeeBankAccountRequest: { name, routingNumber, accountNumber, accountType },
        },
      })
      onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, response)
    })
  }

  const resetToDefaults = () => {
    formMethods.reset(defaultFormValues as DefaultValues<CombinedSchemaInputs>)
  }

  return {
    formMethods,
    isPending: addBankAccountMutation.isPending,
    handleBankAccountSubmit,
    resetToDefaults,
  }
}
