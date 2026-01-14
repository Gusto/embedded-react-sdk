import { useTranslation } from 'react-i18next'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesGetAssignmentsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAssignments'
import { useDepartmentsGetAllSuspense } from '@gusto/embedded-api/react-query/departmentsGetAll'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { Type as PayScheduleAssignmentType } from '@gusto/embedded-api/models/components/payscheduleassignment'
import type { Department } from '@gusto/embedded-api/models/components/department'
import { ManagePayScheduleLandingPresentation } from './ManagePayScheduleLandingPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface ManagePayScheduleLandingProps extends BaseComponentInterface {
  companyId: string
  successAlert?: { messageKey: 'assignmentsUpdated' | 'scheduleUpdated' }
}

export function ManagePayScheduleLanding(props: ManagePayScheduleLandingProps) {
  useI18n('CompanyManagement.ManagePayScheduleLanding')
  useComponentDictionary('CompanyManagement.ManagePayScheduleLanding', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, successAlert }: ManagePayScheduleLandingProps) {
  const { onEvent } = useBase()
  const { t } = useTranslation('CompanyManagement.ManagePayScheduleLanding')

  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({ companyId })
  const { data: assignmentsData } = usePaySchedulesGetAssignmentsSuspense({ companyId })
  const { data: departmentsData } = useDepartmentsGetAllSuspense({ companyUuid: companyId })

  const paySchedules = paySchedulesData.payScheduleList ?? []
  const assignment = assignmentsData.payScheduleAssignment
  const departments = departmentsData.departmentList ?? []
  const assignmentType = assignment?.type ?? null

  const handleManage = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_MANAGE, { currentType: assignmentType })
  }

  const handleEdit = (paySchedule: PayScheduleObject) => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_EDIT, { payScheduleUuid: paySchedule.uuid })
  }

  const handlePreviewPaydays = (paySchedule: PayScheduleObject) => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_PREVIEW_PAYDAYS, {
      payScheduleUuid: paySchedule.uuid,
    })
  }

  const cardTitleTranslations = {
    hourly: t('cardTitles.hourly'),
    salaried: t('cardTitles.salaried'),
    uncategorized: t('cardTitles.uncategorized'),
    unknown: t('cardTitles.unknown'),
  }

  const payScheduleCards = buildPayScheduleCards({
    assignmentType,
    assignment,
    paySchedules,
    departments,
    translations: cardTitleTranslations,
  })

  return (
    <ManagePayScheduleLandingPresentation
      assignmentType={assignmentType}
      payScheduleCards={payScheduleCards}
      onManage={handleManage}
      onEdit={handleEdit}
      onPreviewPaydays={handlePreviewPaydays}
      successAlert={successAlert}
    />
  )
}

export interface PayScheduleCardData {
  title: string
  frequency: string
  customName?: string
  paySchedule: PayScheduleObject
}

interface CardTitleTranslations {
  hourly: string
  salaried: string
  uncategorized: string
  unknown: string
}

interface BuildCardsParams {
  assignmentType: PayScheduleAssignmentType | null | undefined
  assignment:
    | {
        hourlyPayScheduleUuid?: string | null
        salariedPayScheduleUuid?: string | null
        defaultPayScheduleUuid?: string | null
        departments?: Array<{ departmentUuid?: string; payScheduleUuid?: string }> | null
      }
    | undefined
  paySchedules: PayScheduleObject[]
  departments: Department[]
  translations: CardTitleTranslations
}

function buildPayScheduleCards({
  assignmentType,
  assignment,
  paySchedules,
  departments,
  translations,
}: BuildCardsParams): PayScheduleCardData[] {
  const getPayScheduleByUuid = (uuid: string | null | undefined) =>
    paySchedules.find(ps => ps.uuid === uuid)

  if (!assignmentType || assignmentType === 'single') {
    const defaultSchedule = getPayScheduleByUuid(assignment?.defaultPayScheduleUuid)
    if (defaultSchedule) {
      return [
        {
          title: defaultSchedule.customName || defaultSchedule.name || '',
          frequency: defaultSchedule.frequency || '',
          customName: defaultSchedule.customName ?? undefined,
          paySchedule: defaultSchedule,
        },
      ]
    }
    return paySchedules.map(ps => ({
      title: ps.customName || ps.name || '',
      frequency: ps.frequency || '',
      customName: ps.customName ?? undefined,
      paySchedule: ps,
    }))
  }

  if (assignmentType === 'hourly_salaried') {
    const cards: PayScheduleCardData[] = []
    const hourlySchedule = getPayScheduleByUuid(assignment?.hourlyPayScheduleUuid)
    const salariedSchedule = getPayScheduleByUuid(assignment?.salariedPayScheduleUuid)

    if (hourlySchedule) {
      cards.push({
        title: translations.hourly,
        frequency: hourlySchedule.frequency || '',
        customName: hourlySchedule.customName ?? undefined,
        paySchedule: hourlySchedule,
      })
    }
    if (salariedSchedule) {
      cards.push({
        title: translations.salaried,
        frequency: salariedSchedule.frequency || '',
        customName: salariedSchedule.customName ?? undefined,
        paySchedule: salariedSchedule,
      })
    }
    return cards
  }

  if (assignmentType === 'by_employee') {
    const uniqueScheduleUuids = new Set<string>()
    paySchedules.forEach(ps => {
      if (ps.uuid) uniqueScheduleUuids.add(ps.uuid)
    })

    return paySchedules
      .filter(ps => ps.active)
      .map(ps => ({
        title: ps.customName || ps.name || '',
        frequency: ps.frequency || '',
        customName: ps.customName ?? undefined,
        paySchedule: ps,
      }))
  }

  // by_department type
  {
    const cards: PayScheduleCardData[] = []
    const departmentMap = new Map(departments.map(d => [d.uuid, d]))
    const scheduleToDeptsMap = new Map<string, string[]>()

    assignment?.departments?.forEach(dept => {
      if (!dept.payScheduleUuid) return
      const deptName = dept.departmentUuid
        ? departmentMap.get(dept.departmentUuid)?.title
        : undefined
      const existingDepts = scheduleToDeptsMap.get(dept.payScheduleUuid) || []
      existingDepts.push(deptName || translations.unknown)
      scheduleToDeptsMap.set(dept.payScheduleUuid, existingDepts)
    })

    const defaultSchedule = getPayScheduleByUuid(assignment?.defaultPayScheduleUuid)
    if (defaultSchedule?.uuid) {
      const existingDepts = scheduleToDeptsMap.get(defaultSchedule.uuid) || []
      existingDepts.unshift(translations.uncategorized)
      scheduleToDeptsMap.set(defaultSchedule.uuid, existingDepts)
    }

    scheduleToDeptsMap.forEach((deptNames, scheduleUuid) => {
      const schedule = getPayScheduleByUuid(scheduleUuid)
      if (schedule) {
        cards.push({
          title: deptNames.join(' and '),
          frequency: schedule.frequency || '',
          customName: schedule.customName ?? undefined,
          paySchedule: schedule,
        })
      }
    })

    return cards
  }
}
