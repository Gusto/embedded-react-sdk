import { Suspense, useState } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorsGetAddressSuspense } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import { useContractorsUpdateAddressMutation } from '@gusto/embedded-api/react-query/contractorsUpdateAddress'
import { ContractorAddress } from './components/ContractorAddress'
import { ContractorAddressForm } from './components/ContractorAddressForm'
import { ContractorDetails } from './components/ContractorDetails'
import { ContractorPaymentMethod } from './components/ContractorPaymentMethod'
import { ContractorPay } from './components/ContractorPay'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type Mode = 'VIEW' | 'EDIT_ADDRESS'

function ContractorProfileContent() {
  const Components = useComponentContext()
  const companyId = String(import.meta.env.VITE_COMPANY_ID || '')

  const { data } = useContractorsListSuspense({ companyUuid: companyId })
  const contractor = data.contractors?.[0]
  const { data: bankAccountsData } = useContractorPaymentMethodGetBankAccountsSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const bankAccounts = bankAccountsData.contractorBankAccountList ?? []

  const [selectedTab, setSelectedTab] = useState('basic-details')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('VIEW')

  const { data: addressData } = useContractorsGetAddressSuspense({
    contractorUuid: contractor?.uuid ?? '',
  })
  const address = addressData.contractorAddress

  const { mutateAsync: updateAddress, isPending } = useContractorsUpdateAddressMutation()

  if (!contractor) {
    return <Components.Text>No contractors found for this company.</Components.Text>
  }

  const contractorWithAddress = {
    ...contractor,
    address: address ?? contractor.address,
  } as Contractor

  const handleAddressSave = async (data: {
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
    setSuccessMessage('Address updated successfully')
    setMode('VIEW')
  }

  if (mode === 'EDIT_ADDRESS') {
    return (
      <BaseComponent onEvent={() => {}}>
        <ContractorAddressForm
          contractor={contractorWithAddress}
          isPending={isPending}
          onCancel={() => {
            setSuccessMessage(null)
            setMode('VIEW')
          }}
          onSave={handleAddressSave}
        />
      </BaseComponent>
    )
  }

  const tabs = [
    {
      id: 'basic-details',
      label: `Details`,
      content: (
        <Flex flexDirection="column" gap={24}>
          <ContractorDetails contractor={contractor} />
          <ContractorAddress
            contractor={contractorWithAddress}
            onEdit={() => {
              setSuccessMessage(null)
              setMode('EDIT_ADDRESS')
            }}
          />
        </Flex>
      ),
    },
    {
      id: 'pay',
      label: `Pay`,
      content: (
        <Flex flexDirection="column" gap={24}>
          <ContractorPaymentMethod bankAccounts={bankAccounts} />
          <ContractorPay contractor={contractor} />
        </Flex>
      ),
    },
  ]
  return (
    <Flex flexDirection="column" gap={24}>
      {successMessage && (
        <Components.Alert
          disableScrollIntoView
          label={successMessage}
          status="success"
          onDismiss={() => {
            setSuccessMessage(null)
          }}
        />
      )}
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h1" styledAs="h2">
          {contractor.firstName} {contractor.lastName}
        </Components.Heading>
        <Components.Text variant="supporting">Contractor</Components.Text>
      </Flex>
      <Components.Tabs onSelectionChange={setSelectedTab} tabs={tabs} selectedId={selectedTab} />
    </Flex>
  )
}

export function ContractorProfile() {
  const Components = useComponentContext()

  return (
    <Suspense fallback={<Components.Text>Loading contractor...</Components.Text>}>
      <ContractorProfileContent />
    </Suspense>
  )
}
