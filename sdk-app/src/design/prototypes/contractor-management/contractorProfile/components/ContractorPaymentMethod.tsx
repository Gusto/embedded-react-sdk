import type { ContractorBankAccount } from '@gusto/embedded-api/models/components/contractorbankaccount'
import { DataView, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import CirlcePlus from '@/assets/icons/plus-circle.svg?react'

export function ContractorPaymentMethod({
  bankAccounts,
}: {
  bankAccounts: ContractorBankAccount[]
}) {
  const Components = useComponentContext()

  const dataViewProps = useDataView<ContractorBankAccount>({
    data: bankAccounts,
    columns: [
      {
        title: 'Nickname',
        render: account => account.name ?? '–',
      },
      {
        title: 'Routing number',
        render: account => account.routingNumber ?? '–',
      },
      {
        title: 'Account number',
        render: account => account.hiddenAccountNumber ?? '–',
      },
      {
        title: 'Account type',
        render: account => account.accountType ?? '–',
      },
    ],
    itemMenu: () => (
      <HamburgerMenu
        items={[
          {
            label: 'Edit',
            onClick: () => {},
          },
          {
            label: 'Remove account',
            onClick: () => {},
          },
        ]}
        triggerLabel="Actions"
      />
    ),
  })

  if (bankAccounts.length === 0) {
    return (
      <Components.Box
        header={
          <Flex justifyContent="space-between" alignItems="center" gap={4}>
            <Components.Heading as="h3" styledAs="h4">
              Payment
            </Components.Heading>
            <Components.Button variant="secondary">
              <CirlcePlus />
              Add bank account
            </Components.Button>
          </Flex>
        }
      >
        <Components.DescriptionList
          items={[
            {
              term: <Components.Text weight="medium">Payment method</Components.Text>,
              description: <Components.Text>Check</Components.Text>,
            },
          ]}
        />
      </Components.Box>
    )
  }

  return (
    <Components.Box
      withPadding={false}
      header={
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Components.Heading as="h3" styledAs="h4">
            Payment
          </Components.Heading>
          <Components.Button variant="secondary">
            <CirlcePlus />
            Add bank account
          </Components.Button>
        </Flex>
      }
    >
      <DataView isWithinBox label="Bank accounts" {...dataViewProps} />
    </Components.Box>
  )
}
