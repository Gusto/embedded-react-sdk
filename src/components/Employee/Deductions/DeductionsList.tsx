import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useDeductions } from './useDeductions'
import { Hamburger, HamburgerItem, useDataView, DataView } from '@/components/Common'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export const DeductionsList: React.FC = () => {
  const { mode, deductions, handleDelete, handleEdit, isPending } = useDeductions()
  const { t } = useTranslation('Employee.Deductions')
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')

  const activeDeductions = deductions.filter(deduction => deduction.active)

  const { ...dataViewProps } = useDataView({
    data: activeDeductions,
    columns: [
      { key: 'description', title: t('nameColumn') },
      {
        key: 'recurring',
        title: t('frequencyColumn'),
        render: deduction => {
          return deduction.recurring ? t('recurringText') : t('nonRecurringText')
        },
      },
      {
        key: 'amount',
        title: t('withheldColumn'),
        render: deduction => {
          const formattedAmount = deduction.deductAsPercentage
            ? formatPercent(Number(deduction.amount))
            : formatCurrency(Number(deduction.amount))
          return deduction.recurring
            ? t('recurringAmount', { value: formattedAmount })
            : formattedAmount
        },
      },
    ],
    itemMenu: deduction => {
      return (
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
      )
    },
  })

  if (mode !== 'LIST') return
  return <DataView label={t('deductionsTableLabel')} {...dataViewProps} />
}
