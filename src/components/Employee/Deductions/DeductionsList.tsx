import { Hamburger, HamburgerItem } from '@/components/Common'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import { useDeductions } from '@/components/Employee/Deductions/Deductions'
import React from 'react'
import { VisuallyHidden } from 'react-aria'
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export const DeductionsList: React.FC = () => {
  const { mode, deductions, handleDelete, handleEdit, isPending } = useDeductions()
  const { t } = useTranslation('Employee.Deductions')
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')
  if (mode !== 'LIST') return
  return (
    <Table aria-label={t('deductions')}>
      <TableHeader>
        <Column isRowHeader>{t('nameColumn')}</Column>
        <Column>{t('frequencyColumn')}</Column>
        <Column>{t('withheldColumn')}</Column>
        <Column>
          <VisuallyHidden>{t('actionsColumn')}</VisuallyHidden>
        </Column>
      </TableHeader>
      <TableBody renderEmptyState={() => t('emptyListMessage')}>
        {deductions.map(deduction => {
          const formattedAmount = deduction.deduct_as_percentage
            ? formatPercent(Number(deduction.amount))
            : formatCurrency(Number(deduction.amount))

          return (
            deduction.active && (
              <Row key={deduction.uuid}>
                <Cell>{deduction.description}</Cell>
                <Cell>{deduction.recurring ? t('recurringText') : t('nonRecurringText')}</Cell>
                <Cell>
                  {deduction.recurring
                    ? t('recurringAmount', { value: formattedAmount })
                    : formattedAmount}
                </Cell>
                <Cell>
                  <Hamburger title={t('hamburgerTitle')} isPending={isPending}>
                    <HamburgerItem
                      icon={<PencilSvg aria-hidden />}
                      onAction={() => {
                        handleEdit(deduction)
                      }}
                    >
                      {t('editCta')}
                    </HamburgerItem>
                    <HamburgerItem
                      icon={<TrashCanSvg aria-hidden />}
                      onAction={() => {
                        handleDelete(deduction)
                      }}
                    >
                      {t('deleteCta')}
                    </HamburgerItem>
                  </Hamburger>
                </Cell>
              </Row>
            )
          )
        })}
      </TableBody>
    </Table>
  )
}
