import { VisuallyHidden } from 'react-aria'
import { Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { Hamburger, HamburgerItem } from '@/components/Common'
import { usePaymentMethod } from '@/components/Employee/PaymentMethod/PaymentMethod'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'

export function BankAccountsList() {
  const { bankAccounts, paymentMethod, mode, handleDelete, isPending } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  const format = useNumberFormatter(paymentMethod.split_by === 'Amount' ? 'currency' : 'percent')

  if (mode !== 'LIST') return

  return (
    <>
      <Table aria-label={t('bankAccountsListLabel')}>
        <TableHeader>
          <Column isRowHeader>{t('nicknameColumn')}</Column>
          <Column>{t('routingNumberColumn')}</Column>
          <Column>{t('accountTypeColumn')}</Column>
          <Column>{t('allocationColumn')}</Column>
          <Column>
            <VisuallyHidden>{t('actionColumn')}</VisuallyHidden>
          </Column>
        </TableHeader>
        <TableBody>
          {bankAccounts.map(ba => (
            <Row key={ba.uuid}>
              <Cell>
                <strong>{ba.name}</strong>
                <Text slot="description">{ba.hidden_account_number}</Text>
              </Cell>
              <Cell>{ba.routing_number}</Cell>
              <Cell>{ba.account_type}</Cell>
              <Cell>
                {format(
                  paymentMethod.splits?.find(split => split.uuid === ba.uuid)?.split_amount ?? 0,
                )}
              </Cell>
              <Cell>
                <Hamburger title={t('hamburgerTitle')} isPending={isPending}>
                  <HamburgerItem
                    icon={<TrashCanSvg aria-hidden />}
                    onAction={() => {
                      handleDelete(ba.uuid)
                    }}
                  >
                    {t('deleteBankAccountCTA')}
                  </HamburgerItem>
                </Hamburger>
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
