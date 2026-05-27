import { useTranslation } from 'react-i18next'
import { useId } from 'react'
import { EmployeeTable } from '../../shared/EmployeeTable/EmployeeTable'
import type {
  EmployeeItem,
  SelectEmployeesPresentationProps,
} from './SelectEmployeesPresentationTypes'
import styles from './SelectEmployeesPresentation.module.scss'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const isNumericInput = (value: string) => /^\d*\.?\d*$/.test(value)

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
  isHolidayPolicy = false,
  policyTypeLabel,
  balances,
  onBalanceChange,
  pagination,
  isFetching,
  addConfirmDialog,
  isPending = false,
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
          {isHolidayPolicy ? t('holidayDescription') : t('description')}
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
        hideSearch={employees.length === 0 && searchValue.length === 0}
        selectionMode="multiple"
        onSelect={onSelect}
        onSelectAll={onSelectAll}
        getIsItemSelected={item => selectedUuids.has(item.uuid)}
        isFetching={isFetching}
        pagination={pagination}
        emptyState={() => (
          <Flex flexDirection="column" alignItems="center" gap={8}>
            <Text size="sm" textAlign="center">
              {t('emptyState')}
            </Text>
          </Flex>
        )}
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
                  justify: 'end' as const,
                  render: (employee: EmployeeItem) => (
                    <div className={styles.balanceInput}>
                      <Components.TextInput
                        name={`balance-${employee.uuid}`}
                        label={t('startingBalanceColumn')}
                        shouldVisuallyHideLabel
                        aria-labelledby={`employee-name-${employee.uuid} ${balanceColHeaderId}`}
                        value={balances?.[employee.uuid] ?? ''}
                        onChange={(value: string) => {
                          if (value !== '' && !isNumericInput(value)) return
                          onBalanceChange(employee.uuid, value)
                        }}
                        placeholder="0"
                      />
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack} isDisabled={isPending}>
          {t('backCta')}
        </Button>
        <Button variant="primary" onClick={onContinue} isLoading={isPending}>
          {t('continueCta')}
        </Button>
      </ActionsLayout>

      {addConfirmDialog && (
        <Dialog
          isOpen={addConfirmDialog.isOpen}
          onClose={addConfirmDialog.onClose}
          onPrimaryActionClick={addConfirmDialog.onConfirm}
          isPrimaryActionLoading={addConfirmDialog.isPending}
          title={t('addConfirmDialog.title', { count: addConfirmDialog.count })}
          primaryActionLabel={t('addConfirmDialog.confirmCta')}
          closeActionLabel={t('addConfirmDialog.cancelCta')}
        >
          {t('addConfirmDialog.description', { count: addConfirmDialog.count })}
        </Dialog>
      )}
    </Flex>
  )
}
