import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayScheduleAssignmentPreview } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import type { PayScheduleAssignmentEmployeeChange } from '@gusto/embedded-api/models/components/payscheduleassignmentemployeechange'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Department } from '@gusto/embedded-api/models/components/department'
import type { PayScheduleType } from '../ManagePayScheduleAssignment/ManagePayScheduleAssignment'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex, ActionsLayout, DataView } from '@/components/Common'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface ManagePayScheduleReviewPresentationProps {
  preview: PayScheduleAssignmentPreview | null
  assignmentType: PayScheduleType
  departmentsList?: Department[]
  employeesList?: Employee[]
  isLoading: boolean
  isSubmitting: boolean
  onConfirm: () => void
  onBack: () => void
}

interface DepartmentGroup {
  departmentName: string
  changes: PayScheduleAssignmentEmployeeChange[]
}

export function ManagePayScheduleReviewPresentation({
  preview,
  assignmentType,
  departmentsList,
  employeesList,
  isLoading,
  isSubmitting,
  onConfirm,
  onBack,
}: ManagePayScheduleReviewPresentationProps) {
  useI18n('CompanyManagement.ManagePayScheduleReview')
  const { t } = useTranslation('CompanyManagement.ManagePayScheduleReview')
  const { Heading, Text, Button, LoadingSpinner } = useComponentContext()
  const dateFormatter = useDateFormatter()

  const hasChanges = (preview?.employeeChanges?.length ?? 0) > 0
  const showScheduleColumn = assignmentType !== PayScheduleAssignmentBodyType.Single
  const isByDepartment = assignmentType === PayScheduleAssignmentBodyType.ByDepartment

  const departmentGroups = useMemo((): DepartmentGroup[] => {
    if (!isByDepartment || !preview?.employeeChanges) {
      return []
    }

    const employeeMap = new Map(employeesList?.map(e => [e.uuid, e]) ?? [])
    const departmentMap = new Map(departmentsList?.map(d => [d.uuid, d]) ?? [])

    const groupMap = new Map<string, PayScheduleAssignmentEmployeeChange[]>()
    const uncategorizedKey = '__uncategorized__'

    for (const change of preview.employeeChanges) {
      const employee = employeeMap.get(change.employeeUuid ?? '')
      const departmentUuid = employee?.departmentUuid
      const key = departmentUuid ?? uncategorizedKey

      const existing = groupMap.get(key) ?? []
      existing.push(change)
      groupMap.set(key, existing)
    }

    const groups: DepartmentGroup[] = []

    for (const [key, changes] of groupMap) {
      if (key === uncategorizedKey) {
        groups.push({
          departmentName: t('uncategorizedEmployees'),
          changes,
        })
      } else {
        const department = departmentMap.get(key)
        groups.push({
          departmentName: department?.title ?? t('unknownDepartment'),
          changes,
        })
      }
    }

    return groups.sort((a, b) => {
      if (a.departmentName === t('uncategorizedEmployees')) return 1
      if (b.departmentName === t('uncategorizedEmployees')) return -1
      return a.departmentName.localeCompare(b.departmentName)
    })
  }, [isByDepartment, preview?.employeeChanges, employeesList, departmentsList, t])

  if (isLoading) {
    return (
      <Flex flexDirection="column" alignItems="center" justifyContent="center" gap={16}>
        <LoadingSpinner />
        <Text>{t('loading')}</Text>
      </Flex>
    )
  }

  const formatTransitionPeriod = (change: PayScheduleAssignmentEmployeeChange): string => {
    if (!change.transitionPayPeriod) {
      return t('noTransition')
    }
    const { startDate, endDate } = change.transitionPayPeriod
    if (startDate && endDate) {
      return `${dateFormatter.formatShort(startDate)} - ${dateFormatter.formatShort(endDate)}`
    }
    return t('noTransition')
  }

  const getColumns = () => [
    {
      title: <Text weight="semibold">{t('columns.name')}</Text>,
      render: (change: PayScheduleAssignmentEmployeeChange) => (
        <Text weight="semibold">{`${change.firstName} ${change.lastName}`}</Text>
      ),
    },
    ...(showScheduleColumn
      ? [
          {
            title: <Text weight="semibold">{t('columns.newSchedule')}</Text>,
            render: (change: PayScheduleAssignmentEmployeeChange) => (
              <Text>{change.payFrequency}</Text>
            ),
          },
        ]
      : []),
    {
      title: <Text weight="semibold">{t('columns.firstPayDate')}</Text>,
      render: (change: PayScheduleAssignmentEmployeeChange) => (
        <Text>
          {change.firstPayPeriod?.checkDate
            ? dateFormatter.formatShort(change.firstPayPeriod.checkDate)
            : ''}
        </Text>
      ),
    },
    {
      title: <Text weight="semibold">{t('columns.transitionPeriod')}</Text>,
      render: (change: PayScheduleAssignmentEmployeeChange) => (
        <Text>{formatTransitionPeriod(change)}</Text>
      ),
    },
  ]

  const renderGroupedByDepartment = () => (
    <Flex flexDirection="column" gap={32}>
      {departmentGroups.map(group => (
        <Flex key={group.departmentName} flexDirection="column" gap={16}>
          <Heading as="h3">{group.departmentName}</Heading>
          <DataView
            label={`${t('tableLabel')} - ${group.departmentName}`}
            columns={getColumns()}
            data={group.changes}
          />
        </Flex>
      ))}
    </Flex>
  )

  const renderSingleTable = () => (
    <DataView
      label={t('tableLabel')}
      columns={getColumns()}
      data={preview?.employeeChanges ?? []}
    />
  )

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={2}>
        <Heading as="h2">{hasChanges ? t('title') : t('emptyTitle')}</Heading>
        <Text variant="supporting">{hasChanges ? t('description') : t('emptyDescription')}</Text>
      </Flex>

      {hasChanges && (isByDepartment ? renderGroupedByDepartment() : renderSingleTable())}

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack}>
          {t('backButton')}
        </Button>
        <Button onClick={onConfirm} isDisabled={isSubmitting}>
          {isSubmitting ? t('submitting') : t('confirmButton')}
        </Button>
      </ActionsLayout>
    </Flex>
  )
}
