import { useTranslation } from 'react-i18next'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { UseDeductionsListReady } from '../shared/useDeductionsList'
import { formatDeductionAmount } from '../shared/formatDeductionAmount'
import { useDataView, DataView } from '@/components/Common'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

export interface DeductionsListProps {
  className?: string
  deductionsList: UseDeductionsListReady
  onAdd: () => void
  onEdit: (deduction: Garnishment) => void
  onDelete: (deduction: Garnishment) => void
  onContinue: () => void
}

export function DeductionsList({
  className,
  deductionsList,
  onAdd,
  onEdit,
  onDelete,
  onContinue,
}: DeductionsListProps) {
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')

  const { deductions } = deductionsList.data
  const isPendingAny = deductionsList.status.isPending

  const { ...dataViewProps } = useDataView({
    data: deductions,
    columns: [
      {
        key: 'description',
        title: t('nameColumn'),
      },
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
        render: deduction =>
          formatDeductionAmount(deduction, {
            formatCurrency,
            formatPercent,
            formatPerPaycheck: (value: string) => t('recurringAmount', { value }),
          }),
      },
    ],
    itemMenu: deduction => {
      return (
        <HamburgerMenu
          isLoading={isPendingAny}
          items={[
            {
              label: t('editCta'),
              onClick: () => {
                onEdit(deduction)
              },
              icon: <PencilSvg aria-hidden />,
            },
            {
              label: t('deleteCta'),
              onClick: () => {
                onDelete(deduction)
              },
              icon: <TrashCanSvg aria-hidden />,
            },
          ]}
        />
      )
    },
  })

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex flexDirection="column" gap={2}>
          <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
          <Components.Text variant="supporting">
            {t('includeDeductionsDescriptionV2')}
          </Components.Text>
        </Flex>

        <DataView label={t('deductionsTableLabel')} {...dataViewProps} />
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={onAdd}>
            <PlusCircleIcon />
            {t('addDeductionCta')}
          </Components.Button>
          <Components.Button onClick={onContinue}>{t('continueCta')}</Components.Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}
