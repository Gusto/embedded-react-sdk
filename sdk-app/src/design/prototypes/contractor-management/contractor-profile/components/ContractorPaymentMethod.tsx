import type { ContractorBankAccount } from '@gusto/embedded-api/models/components/contractorbankaccount'
import { Skeleton } from './Skeleton'
import { DataView, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import CirclePlus from '@/assets/icons/plus-circle.svg?react'

export function ContractorPaymentMethod({
  paymentMethodType,
  bankAccounts,
  onAddPaymentMethod,
  onEditPaymentMethod,
  onRemoveAccount,
  isRemovingAccount,
}: {
  paymentMethodType: 'Check' | 'Direct Deposit'
  bankAccounts: ContractorBankAccount[]
  onAddPaymentMethod?: () => void
  onEditPaymentMethod?: () => void
  onRemoveAccount?: () => void
  isRemovingAccount?: boolean
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
    itemMenu:
      onEditPaymentMethod || onRemoveAccount
        ? () => (
            <HamburgerMenu
              items={[
                ...(onEditPaymentMethod ? [{ label: 'Edit', onClick: onEditPaymentMethod }] : []),
                ...(onRemoveAccount ? [{ label: 'Remove account', onClick: onRemoveAccount }] : []),
              ]}
              triggerLabel="Actions"
            />
          )
        : undefined,
  })

  if (paymentMethodType === 'Check' && !isRemovingAccount) {
    return (
      <Components.Box
        header={
          <Flex justifyContent="space-between" alignItems="center" gap={4}>
            <Components.Heading as="h3" styledAs="h4">
              Payment
            </Components.Heading>
            {onAddPaymentMethod && (
              <Components.Button variant="secondary" onClick={onAddPaymentMethod}>
                <CirclePlus />
                Add bank account
              </Components.Button>
            )}
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
        </Flex>
      }
    >
      {isRemovingAccount ? (
        <Skeleton width="100%" height={48} />
      ) : (
        <DataView isWithinBox label="Bank accounts" {...dataViewProps} />
      )}
    </Components.Box>
  )
}
