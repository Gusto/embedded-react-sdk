import { Suspense, useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import {
  useContractorPaymentMethodGetSuspense,
  buildContractorPaymentMethodGetQuery,
} from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import { useContractorPaymentMethodsCreateBankAccountMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodsCreateBankAccount'
import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import { ContractorAddress } from './components/ContractorAddress'
import { ContractorAddressForm } from './components/ContractorAddressForm'
import { ContractorDetails } from './components/ContractorDetails'
import { ContractorPaymentMethod } from './components/ContractorPaymentMethod'
import { ContractorPaymentMethodForm } from './components/ContractorPaymentMethodForm'
import { ContractorDocuments } from './components/ContractorDocuments'
import { ContractorPay } from './components/ContractorPay'
import { ContractorPayForm } from './components/ContractorPayForm'
import { ContractorDetailsForm } from './components/ContractorDetailsForm'
import { Skeleton } from './components/Skeleton'
import { Flex } from '@/components/Common'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, type EventType } from '@/shared/constants'

export interface ContractorProfileContextInterface extends FlowContextInterface {
  contractorId: string
  successMessage?: string
  selectedTab: string
  component: React.ComponentType | null
}

function useContractorData(contractorId: string) {
  const { data } = useContractorsGetSuspense({ contractorUuid: contractorId })
  return data.contractor
}

function ProfileSkeleton() {
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={4}>
        <Skeleton width={200} height={28} />
        <Skeleton width={80} height={18} />
      </Flex>
      <Flex flexDirection="column" gap={24}>
        <Components.Box header={<Skeleton width={120} height={42} />}>
          <Skeleton width="100%" height={331} />
        </Components.Box>
        <Components.Box header={<Skeleton width={120} height={42} />}>
          <Skeleton width="100%" height={88} />
        </Components.Box>
      </Flex>
    </Flex>
  )
}

function ProfileViewData() {
  const { contractorId } = useFlow<ContractorProfileContextInterface>()
  const Components = useComponentContext()

  const contractor = useContractorData(contractorId)

  if (!contractor) {
    return <Components.Text>No contractors found for this company.</Components.Text>
  }

  return <ProfileViewContent contractor={contractor} />
}

export function ProfileViewContextual() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileViewData />
    </Suspense>
  )
}

function ProfileViewContent({ contractor }: { contractor: Contractor }) {
  const { onEvent, successMessage, selectedTab } = useFlow<ContractorProfileContextInterface>()
  const Components = useComponentContext()
  const [localTab, setLocalTab] = useState(selectedTab)
  const [isDismissed, setIsDismissed] = useState(false)

  const { data: bankAccountsData } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractor.uuid,
  })
  const bankAccounts = bankAccountsData.contractorBankAccountList ?? []

  const { data: paymentMethodData } = useContractorPaymentMethodGetSuspense({
    contractorUuid: contractor.uuid,
  })
  const paymentMethod = paymentMethodData.contractorPaymentMethod

  const { data: addressData } = useContractorsGetAddressSuspense({
    contractorUuid: contractor.uuid,
  })
  const address = addressData.contractorAddress

  const { data: documentsData } = useContractorDocumentsGetAllSuspense({
    contractorUuid: contractor.uuid,
  })
  const documents = documentsData.documents ?? []

  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()

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
          <ContractorDetails
            contractor={contractor}
            onEdit={() => {
              onEvent('contractor/details/edit' as EventType)
            }}
          />
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
          <ContractorPay
            contractor={contractor}
            onEdit={() => {
              onEvent('contractor/compensation/edit' as EventType)
            }}
          />
        </Flex>
      ),
    },
    {
      id: 'documents',
      label: 'Documents',
      content: <ContractorDocuments documents={documents} />,
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
          {[contractor.firstName, contractor.middleInitial, contractor.lastName]
            .filter(Boolean)
            .join(' ')}
        </Components.Heading>
        <Components.Text variant="supporting">Contractor</Components.Text>
      </Flex>
      <Components.Tabs onSelectionChange={setLocalTab} tabs={tabs} selectedId={localTab} />
    </Flex>
  )
}

function EditAddressContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
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

export function EditAddressContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditAddressContent />
    </BaseComponent>
  )
}

function AddPaymentMethodContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)

  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: isBankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    name: string
    routingNumber: string
    accountNumber: string
    accountType: 'Checking' | 'Savings'
  }) => {
    await createBankAccount({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          name: data.name,
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
        },
      },
    })

    const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
      contractorUuid: contractor.uuid,
    })
    const updatedPaymentMethod = await queryClient.fetchQuery(getPaymentMethodQuery)
    const version = updatedPaymentMethod.contractorPaymentMethod?.version as string

    await updatePaymentMethod({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version,
          type: 'Direct Deposit',
        },
      },
    })

    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED)
  }

  return (
    <ContractorPaymentMethodForm
      variant="add"
      isPending={isPaymentMethodPending || isBankAccountPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function AddPaymentMethodContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <AddPaymentMethodContent />
    </BaseComponent>
  )
}

function EditPaymentMethodContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
  const { data: bankAccountsData } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const bankAccounts = bankAccountsData.contractorBankAccountList ?? []

  const queryClient = useQueryClient()
  const gustoClient = useGustoEmbeddedContext()
  const { mutateAsync: updatePaymentMethod, isPending: isPaymentMethodPending } =
    useContractorPaymentMethodUpdateMutation()
  const { mutateAsync: createBankAccount, isPending: isBankAccountPending } =
    useContractorPaymentMethodsCreateBankAccountMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    name: string
    routingNumber: string
    accountNumber: string
    accountType: 'Checking' | 'Savings'
  }) => {
    await createBankAccount({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          name: data.name,
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
          accountType: data.accountType,
        },
      },
    })

    const getPaymentMethodQuery = buildContractorPaymentMethodGetQuery(gustoClient, {
      contractorUuid: contractor.uuid,
    })
    const updatedPaymentMethod = await queryClient.fetchQuery(getPaymentMethodQuery)
    const version = updatedPaymentMethod.contractorPaymentMethod?.version as string

    await updatePaymentMethod({
      request: {
        contractorUuid: contractor.uuid,
        requestBody: {
          version,
          type: 'Direct Deposit',
        },
      },
    })

    onEvent(componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED)
  }

  return (
    <ContractorPaymentMethodForm
      variant="edit"
      bankAccount={bankAccounts[0]}
      isPending={isPaymentMethodPending || isBankAccountPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditPaymentMethodContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditPaymentMethodContent />
    </BaseComponent>
  )
}

function EditCompensationContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
  const { mutateAsync: updateContractor, isPending } = useContractorsUpdateMutation()

  if (!contractor) return null

  const handleSave = async (data: { wageType: 'Fixed' | 'Hourly'; hourlyRate?: string }) => {
    await updateContractor({
      request: {
        contractorUuid: contractor.uuid,
        contractorUpdateRequestBody: {
          version: contractor.version as string,
          wageType: data.wageType,
          ...(data.wageType === 'Hourly' ? { hourlyRate: data.hourlyRate } : {}),
        },
      },
    })
    onEvent(componentEvents.CONTRACTOR_UPDATED)
  }

  return (
    <ContractorPayForm
      contractor={contractor}
      isPending={isPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditCompensationContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditCompensationContent />
    </BaseComponent>
  )
}

function EditBasicDetailsContent() {
  const { contractorId, onEvent } = useFlow<ContractorProfileContextInterface>()

  const contractor = useContractorData(contractorId)
  const { mutateAsync: updateContractor, isPending } = useContractorsUpdateMutation()

  if (!contractor) return null

  const handleSave = async (data: {
    firstName: string
    middleInitial?: string
    lastName: string
    startDate?: string
    ssn?: string
    email?: string
  }) => {
    await updateContractor({
      request: {
        contractorUuid: contractor.uuid,
        contractorUpdateRequestBody: {
          version: contractor.version as string,
          firstName: data.firstName,
          middleInitial: data.middleInitial || undefined,
          lastName: data.lastName,
          startDate: data.startDate || undefined,
          ...(data.ssn ? { ssn: data.ssn } : {}),
          email: data.email || undefined,
        },
      },
    })
    onEvent(componentEvents.CONTRACTOR_UPDATED)
  }

  return (
    <ContractorDetailsForm
      contractor={contractor}
      isPending={isPending}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      onSave={handleSave}
    />
  )
}

export function EditBasicDetailsContextual() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EditBasicDetailsContent />
    </BaseComponent>
  )
}
