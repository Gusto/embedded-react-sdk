import { useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import {
  useContractorPaymentMethodGetSuspense,
  buildContractorPaymentMethodGetQuery,
} from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import { ContractorAddress } from './components/ContractorAddress'
import { ContractorAddressForm } from './components/ContractorAddressForm'
import { ContractorDetails } from './components/ContractorDetails'
import { ContractorPaymentMethod } from './components/ContractorPaymentMethod'
import { ContractorPaymentMethodForm } from './components/ContractorPaymentMethodForm'
import { ContractorPay } from './components/ContractorPay'
import { Flex } from '@/components/Common'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, type EventType } from '@/shared/constants'

export interface ContractorProfileContextInterface extends FlowContextInterface {
  companyId: string
  successMessage?: string
  selectedTab: string
  component: React.ComponentType | null
}

function useContractorData(companyId: string) {
  const { data } = useContractorsListSuspense({ companyUuid: companyId })
  const contractor = data.contractors?.[0]
  return contractor
}

export function ProfileViewContextual() {
  const { companyId, onEvent, successMessage, selectedTab } =
    useFlow<ContractorProfileContextInterface>()
  const Components = useComponentContext()
  const [localTab, setLocalTab] = useState(selectedTab)
  const [isDismissed, setIsDismissed] = useState(false)

  const contractor = useContractorData(companyId)

  const { data: bankAccountsData } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const bankAccounts = bankAccountsData.contractorBankAccountList ?? []

  const { data: paymentMethodData } = useContractorPaymentMethodGetSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const paymentMethod = paymentMethodData.contractorPaymentMethod

  const { data: addressData } = useContractorsGetAddressSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const address = addressData.contractorAddress

  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()

  if (!contractor) {
    return <Components.Text>No contractors found for this company.</Components.Text>
  }

  const contractorWithAddress = {
    ...contractor,
    address: address ?? contractor.address,
  } as Contractor

  const handleRemoveAccount = async () => {
    await updatePaymentMethod({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version: paymentMethod?.version as string,
          type: 'Check',
        },
      },
    })
    onEvent('contractor/paymentMethod/removed' as EventType)
  }

  const tabs = [
    {
      id: 'basic-details',
      label: 'Details',
      content: (
        <Flex flexDirection="column" gap={24}>
          <ContractorDetails contractor={contractor} />
          <ContractorAddress
            contractor={contractorWithAddress}
            onEdit={() => {
              onEvent('contractor/address/edit' as EventType)
            }}
          />
        </Flex>
      ),
    },
    {
      id: 'pay',
      label: 'Pay',
      content: (
        <Flex flexDirection="column" gap={24}>
          <ContractorPaymentMethod
            paymentMethodType={paymentMethod?.type ?? 'Check'}
            bankAccounts={bankAccounts}
            onAddPaymentMethod={() => {
              onEvent('contractor/paymentMethod/add' as EventType)
            }}
            onEditPaymentMethod={() => {
              onEvent('contractor/paymentMethod/edit' as EventType)
            }}
            onRemoveAccount={handleRemoveAccount}
            isRemovingAccount={isPaymentMethodPending}
          />
          <ContractorPay contractor={contractor} />
        </Flex>
      ),
    },
  ]

  return (
    <Flex flexDirection="column" gap={24}>
      {successMessage && !isDismissed && (
        <Components.Alert
          disableScrollIntoView
          label={successMessage}
          status="success"
          onDismiss={() => {
            setIsDismissed(true)
          }}
        />
      )}
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h1" styledAs="h2">
          {contractor.firstName} {contractor.lastName}
        </Components.Heading>
        <Components.Text variant="supporting">Contractor</Components.Text>
      </Flex>
      <Components.Tabs onSelectionChange={setLocalTab} tabs={tabs} selectedId={localTab} />
    </Flex>
  )
}

export function EditAddressContextual() {
  const { companyId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(companyId)
  const { data: addressData } = useContractorsGetAddressSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const address = addressData.contractorAddress

  const { mutateAsync: updateAddress, isPending } = useContractorsUpdateAddressMutation()

  if (!contractor) return null

  const contractorWithAddress = {
    ...contractor,
    address: address ?? contractor.address,
  } as Contractor

  const handleSave = async (data: {
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
  }) => {
    await updateAddress({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version: address?.version as string,
          street1: data.street1,
          street2: data.street2,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
      },
    })
    onEvent(componentEvents.CONTRACTOR_ADDRESS_UPDATED)
  }

  return (
    <ContractorAddressForm
      contractor={contractorWithAddress}
      isPending={isPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function AddPaymentMethodContextual() {
  const { companyId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(companyId)
  const { data: paymentMethodData } = useContractorPaymentMethodGetSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const paymentMethod = paymentMethodData.contractorPaymentMethod

  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: isBankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    type: 'Check' | 'Direct Deposit'
    name?: string
    routingNumber?: string
    accountNumber?: string
    accountType?: 'Checking' | 'Savings'
  }) => {
    let version = paymentMethod?.version as string

    if (data.type === 'Direct Deposit') {
      await createBankAccount({
        request: {
          contractorUuid: contractor.uuid,
          requestBody: {
            name: data.name!,
            routingNumber: data.routingNumber!,
            accountNumber: data.accountNumber!,
            accountType: data.accountType!,
          },
        },
      })

      const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
        contractorUuid: contractor.uuid,
      })
      const updatedPaymentMethod = await queryClient.fetchQuery(getPaymentMethodQuery)
      version = updatedPaymentMethod.contractorPaymentMethod?.version as string
    }

    await updatePaymentMethod({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version,
          type: data.type,
        },
      },
    })

    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED)
  }

  return (
    <ContractorPaymentMethodForm
      variant="add"
      paymentMethodType={paymentMethod?.type ?? 'Check'}
      isPending={isPaymentMethodPending || isBankAccountPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditPaymentMethodContextual() {
  const { companyId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(companyId)
  const { data: bankAccountsData } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const bankAccounts = bankAccountsData.contractorBankAccountList ?? []

  const { data: paymentMethodData } = useContractorPaymentMethodGetSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const paymentMethod = paymentMethodData.contractorPaymentMethod

  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: isBankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    type: 'Check' | 'Direct Deposit'
    name?: string
    routingNumber?: string
    accountNumber?: string
    accountType?: 'Checking' | 'Savings'
  }) => {
    let version = paymentMethod?.version as string

    if (data.type === 'Direct Deposit') {
      await createBankAccount({
        request: {
          contractorUuid: contractor.uuid,
          requestBody: {
            name: data.name!,
            routingNumber: data.routingNumber!,
            accountNumber: data.accountNumber!,
            accountType: data.accountType!,
          },
        },
      })

      const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
        contractorUuid: contractor.uuid,
      })
      const updatedPaymentMethod = await queryClient.fetchQuery(getPaymentMethodQuery)
      version = updatedPaymentMethod.contractorPaymentMethod?.version as string
    }

    await updatePaymentMethod({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version,
          type: data.type,
        },
      },
    })

    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED)
  }

  return (
    <ContractorPaymentMethodForm
      variant="edit"
      bankAccount={bankAccounts[0]}
      paymentMethodType={paymentMethod?.type ?? 'Check'}
      isPending={isPaymentMethodPending || isBankAccountPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}
