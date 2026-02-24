import { useTranslation } from 'react-i18next'
import styles from './OffCycleTaxWithholdingTable.module.scss'
import type {
  OffCycleTaxWithholdingTableProps,
  WageTypeGroup,
} from './OffCycleTaxWithholdingTableTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import type { TableData, TableRow } from '@/components/Common/UI/Table/TableTypes'

export function OffCycleTaxWithholdingTable({
  wageTypeGroups,
  config,
  onEditClick,
}: OffCycleTaxWithholdingTableProps) {
  useI18n('Payroll.OffCycleTaxWithholding')
  const { t } = useTranslation('Payroll.OffCycleTaxWithholding')
  const { Table, Button, Heading, Text } = useComponentContext()

  const frequencyText = t(`payPeriodFrequency.${config.payPeriodFrequency}` as const).toLowerCase()

  const taxedAsByCategory: Record<WageTypeGroup['category'], string> = {
    regular: t('table.taxedAsRegular', { frequency: frequencyText }),
    supplemental:
      config.withholdingRate === 'supplemental'
        ? t('table.taxedAsSupplemental')
        : t('table.taxedAsRegular', { frequency: frequencyText }),
    reimbursement: t('table.taxedAsNotTaxed'),
  }

  const headers: TableData[] = [
    { key: 'wage-types', content: t('table.headers.wageTypes') },
    { key: 'taxed-as', content: t('table.headers.taxedAs') },
  ]

  const rows: TableRow[] = wageTypeGroups.map(group => ({
    key: group.id,
    data: [
      {
        key: `${group.id}-type`,
        content: (
          <div className={styles.wageTypeCell}>
            <Text weight="semibold">{group.label}</Text>
            {group.description && <Text variant="supporting">{group.description}</Text>}
          </div>
        ),
      },
      {
        key: `${group.id}-taxed-as`,
        content: taxedAsByCategory[group.category],
      },
    ],
  }))

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Heading as="h3">{t('title')}</Heading>
          <Text variant="supporting">{t('description')}</Text>
        </div>
        <Button variant="secondary" onClick={onEditClick}>
          {t('editButton')}
        </Button>
      </div>
      <Table aria-label={t('title')} headers={headers} rows={rows} className={styles.table} />
    </div>
  )
}
