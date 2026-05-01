import { useTranslation } from 'react-i18next'
import type { EmployeeTableItem } from '../EmployeeTable/EmployeeTableTypes'
import { EmployeeTable } from '../EmployeeTable/EmployeeTable'
import type { PolicyDetailLayoutProps } from './PolicyDetailLayoutTypes'
import { DetailViewLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const EMPLOYEES_TAB_ID = 'employees'

export function PolicyDetailLayout<T extends EmployeeTableItem>({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
  firstTab,
  selectedTabId,
  onTabChange,
  employees,
  removeDialog,
  successAlert,
  onDismissAlert,
}: PolicyDetailLayoutProps<T>) {
  useI18n('Company.TimeOff.PolicyDetail')
  const { t } = useTranslation('Company.TimeOff.PolicyDetail')
  const { Alert, Dialog, Box } = useComponentContext()

  const tabs = [
    {
      id: firstTab.id,
      label: firstTab.label,
      content: firstTab.content,
    },
    {
      id: EMPLOYEES_TAB_ID,
      label: t('tabs.employees'),
      content: (
        <Box withPadding={false}>
          <EmployeeTable<T>
            data={employees.data}
            searchValue={employees.searchValue}
            onSearchChange={employees.onSearchChange}
            onSearchClear={employees.onSearchClear}
            searchPlaceholder={employees.searchPlaceholder}
            itemMenu={employees.itemMenu}
            pagination={employees.pagination}
            isFetching={employees.isFetching}
            emptyState={employees.emptyState}
            additionalColumns={employees.additionalColumns}
          />
        </Box>
      ),
    },
  ]

  return (
    <>
      {successAlert && <Alert status="success" label={successAlert} onDismiss={onDismissAlert} />}

      <DetailViewLayout
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        backLabel={backLabel}
        actions={actions}
        tabs={tabs}
        selectedTabId={selectedTabId}
        onTabChange={onTabChange}
      />

      <Dialog
        isOpen={removeDialog.isOpen}
        onClose={removeDialog.onClose}
        onPrimaryActionClick={removeDialog.onConfirm}
        isPrimaryActionLoading={removeDialog.isPending}
        isDestructive
        title={t('removeEmployeeDialog.title', { name: removeDialog.employeeName })}
        primaryActionLabel={t('removeEmployeeDialog.confirmCta')}
        closeActionLabel={t('removeEmployeeDialog.cancelCta')}
      >
        {t('removeEmployeeDialog.description', { name: removeDialog.employeeName })}
      </Dialog>
    </>
  )
}
