import { VisuallyHidden } from 'react-aria'
import { Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { Hamburger, HamburgerItem } from '@/components/Common'
import { usePaymentMethod } from '@/components/Employee/PaymentMethodCombo/PaymentMethod'
import { useForm } from 'react-hook-form'

export function BankAccountsList() {
  const { bankAccounts, watchedType, mode, handleDelete } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')

  if (mode !== 'LIST') return

  return (
    <>
      <Table aria-label={t('bankAccountsListLabel')}>
        <TableHeader>
          <Column isRowHeader>{t('nicknameColumn')}</Column>
          <Column>{t('routingNumberColumn')}</Column>
          <Column>{t('accountTypeColumn')}</Column>
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
                <Hamburger title={t('hamburgerTitle')}>
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
