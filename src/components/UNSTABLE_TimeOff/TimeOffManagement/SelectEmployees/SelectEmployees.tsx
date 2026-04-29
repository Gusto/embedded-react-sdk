import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { EmployeeTable } from '../../shared/EmployeeTable/EmployeeTable'
import type {
  EmployeeItem,
  SelectEmployeesProps,
} from './SelectEmployeesTypes'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export function SelectEmployees({
  employees,
  selectedUuids,
  searchValue,
  onSelect,
  onSearchChange,
  onSearchClear,
  onBack,
  onContinue,
  showReassignmentWarning,
  balances,
  onBalanceChange,
  pagination,
  isFetching,
}: SelectEmployeesProps) {
  useI18n('Company.TimeOff.SelectEmployees')
  const { t } = useTranslation('Company.TimeOff.SelectEmployees')
  const Components = useComponentContext()
  const { Heading, Text, Button, Alert } = Components
  const balanceColHeaderId = useId()

  return (
    <Flex flexDirection="column" alignItems="stretch" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">
          {showReassignmentWarning ? t('description') : t('holidayDescription')}
        </Text>
      </Flex>

      {showReassignmentWarning && <Alert status="warning" label={t('reassignmentWarning')} />}

      <EmployeeTable<EmployeeItem>
        data={employees}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchClear={onSearchClear}
        selectionMode="multiple"
        onSelect={onSelect}
        getIsItemSelected={item => selectedUuids.has(item.uuid)}
        isFetching={isFetching}
        pagination={pagination}
        additionalColumns={[
          {
            key: 'department',
            title: t('departmentColumn'),
          },
          ...(onBalanceChange
            ? [
                {
                  key: 'balance',
                  title: <span id={balanceColHeaderId}>{t('startingBalanceColumn')}</span>,
                  render: (employee: EmployeeItem) => (
                    <Components.TextInput
                      name={`balance-${employee.uuid}`}
                      label={t('startingBalanceColumn')}
                      shouldVisuallyHideLabel
                      aria-labelledby={`employee-name-${employee.uuid} ${balanceColHeaderId}`}
                      value={balances?.[employee.uuid] ?? ''}
                      onChange={(value: string) => {
                        onBalanceChange(employee.uuid, value)
                      }}
                      placeholder="0"
                    />
                  ),
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
    </Flex>
  )
}
