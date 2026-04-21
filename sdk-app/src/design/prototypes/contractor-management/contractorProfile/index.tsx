import { Suspense, useState } from 'react'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorPaymentMethodGetBankAccountsSuspense } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { ContractorAddress } from './components/ContractorAddress'
import { ContractorDetails } from './components/ContractorDetails'
import { ContractorPaymentMethod } from './components/ContractorPaymentMethod'
import { ContractorPay } from './components/ContractorPay'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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

  if (!contractor) {
    return <Components.Text>No contractors found for this company.</Components.Text>
  }

  const tabs = [
    {
      id: 'basic-details',
      label: `Details`,
      content: (
        <Flex flexDirection="column" gap={24}>
          <ContractorDetails contractor={contractor} />
          <ContractorAddress contractor={contractor} />
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
