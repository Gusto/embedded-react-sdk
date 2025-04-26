import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useDeductions } from './useDeductions'
import { useDataView, DataView } from '@/components/Common'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const DeductionsList: React.FC = () => {
  const { mode, deductions, handleDelete, handleEdit, isPending } = useDeductions()
  const { t } = useTranslation('Employee.Deductions')
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')
  const Components = useComponentContext()

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
        <Components.HamburgerMenu
          isLoading={isPending}
          items={[
            {
              label: t('editCta'),
              onClick: () => {
                handleEdit(deduction)
              },
              icon: <PencilSvg aria-hidden />,
            },
            {
              label: t('deleteCta'),
              onClick: () => {
                handleDelete(deduction)
              },
              icon: <TrashCanSvg aria-hidden />,
            },
          ]}
        />
      )
    },
  })

  if (mode !== 'LIST') return
  return <DataView label={t('deductionsTableLabel')} {...dataViewProps} />
}
