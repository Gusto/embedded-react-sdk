import { useTranslation } from 'react-i18next'
import { useId } from 'react'
import { EmployeeTable } from '../../shared/EmployeeTable/EmployeeTable'
import type {
  EmployeeItem,
  SelectEmployeesPresentationProps,
} from './SelectEmployeesPresentationTypes'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export function SelectEmployeesPresentation({
  employees,
  selectedUuids,
  searchValue,
  onSelect,
  onSelectAll,
  onSearchChange,
  onSearchClear,
  onBack,
  onContinue,
  showReassignmentWarning,
  policyTypeLabel,
  balances,
  onBalanceChange,
  pagination,
  isFetching,
  originallyOnPolicyUuids,
  originalBalances,
  removeConfirmDialog,
}: SelectEmployeesPresentationProps) {
  useI18n('Company.TimeOff.SelectEmployees')
  const { t } = useTranslation('Company.TimeOff.SelectEmployees')
  const Components = useComponentContext()
  const { Heading, Text, Button, Alert, Dialog } = Components
  const balanceColHeaderId = useId()

  return (
    <Flex flexDirection="column" alignItems="stretch" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">
          {showReassignmentWarning ? t('description') : t('holidayDescription')}
        </Text>
      </Flex>

      {showReassignmentWarning && (
        <Alert status="warning" label={t('reassignmentWarning', { policyType: policyTypeLabel })} />
      )}

      <EmployeeTable<EmployeeItem>
        data={employees}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchClear={onSearchClear}
        selectionMode="multiple"
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        getIsItemSelected={item => selectedUuids.has(item.uuid)}
        isFetching={isFetching}
        pagination={pagination}
        additionalColumns={[
          {
            key: 'department' as keyof EmployeeItem,
            title: t('departmentColumn'),
          },
          ...(onBalanceChange
            ? [
                {
                  key: 'balance' as keyof EmployeeItem,
                  title: t('startingBalanceColumn'),
                  render: (employee: EmployeeItem) => {
                    if (originallyOnPolicyUuids?.has(employee.uuid)) {
                      return <Text>{originalBalances?.[employee.uuid] ?? '0'}</Text>
                    }
                    return (
                      <Components.TextInput
                        name={`balance-${employee.uuid}`}
                        label={t('startingBalanceColumn')}
                        shouldVisuallyHideLabel
                        aria-labelledby={`employee-name-${employee.uuid} ${balanceColHeaderId}`}
                        value={balances?.[employee.uuid] ?? ''}
                        onChange={(value: string) => {
                          const numeric = value.replace(/[^0-9.]/g, '')
                          if (numeric !== value) return
                          if ((numeric.match(/\./g) ?? []).length > 1) return
                          onBalanceChange(employee.uuid, numeric)
                        }}
                        placeholder="0"
                      />
                    )
                  },
                },
              ]
            : []),
        ]}
      />

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack}>
          {t('backCta')}
        </Button>
        <Button variant="primary" onClick={onContinue}>
          {t('continueCta')}
        </Button>
      </ActionsLayout>

      {removeConfirmDialog && (
        <Dialog
          isOpen={removeConfirmDialog.isOpen}
          onClose={removeConfirmDialog.onClose}
          onPrimaryActionClick={removeConfirmDialog.onConfirm}
          isPrimaryActionLoading={removeConfirmDialog.isPending}
          isDestructive
          title={t('removeConfirmDialog.title', { count: removeConfirmDialog.count })}
          primaryActionLabel={t('removeConfirmDialog.confirmCta')}
          closeActionLabel={t('removeConfirmDialog.cancelCta')}
        >
          {t('removeConfirmDialog.description', { count: removeConfirmDialog.count })}
        </Dialog>
      )}
    </Flex>
  )
}
