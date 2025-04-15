import { useTranslation } from 'react-i18next'
import { usePaymentMethod } from './usePaymentMethod'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { DataView, Hamburger, HamburgerItem, useDataView } from '@/components/Common'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'

export function BankAccountsList() {
  const { bankAccounts, paymentMethod, mode, handleDelete, isPending } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  const format = useNumberFormatter(paymentMethod.splitBy === 'Amount' ? 'currency' : 'percent')

  const { ...dataViewProps } = useDataView({
    data: bankAccounts,
    columns: [
      { key: 'name', title: t('nicknameColumn') },
      { key: 'routingNumber', title: t('routingNumberColumn') },
      { key: 'accountType', title: t('accountTypeColumn') },
      {
        key: 'splitAmount',
        title: t('allocationColumn'),
        render: bankAccount => {
          return format(
            paymentMethod.splits?.find(split => split.uuid === bankAccount.uuid)?.splitAmount ?? 0,
          )
        },
      },
    ],
    itemMenu: bankAccount => {
      return (
        <Hamburger title={t('hamburgerTitle')} isPending={isPending}>
          <HamburgerItem
            icon={<TrashCanSvg aria-hidden />}
            onAction={() => {
              handleDelete(bankAccount.uuid)
            }}
          >
            {t('deleteBankAccountCTA')}
          </HamburgerItem>
        </Hamburger>
      )
    },
  })

  if (mode !== 'LIST') return

  return <DataView label={t('bankAccountsListLabel')} {...dataViewProps} />
}
