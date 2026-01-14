import { useState, useMemo } from 'react'
import { usePaySchedulesPreviewAssignmentMutation } from '@gusto/embedded-api/react-query/paySchedulesPreviewAssignment'
import { usePaySchedulesAssignMutation } from '@gusto/embedded-api/react-query/paySchedulesAssign'
import type { PayScheduleAssignmentPreview } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import {
  type PayScheduleAssignmentBody,
  PayScheduleAssignmentBodyType,
} from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { useEffect } from 'react'
import type { AssignmentData } from '../ManagePayScheduleAssignment/ManagePayScheduleAssignment'
import { ManagePayScheduleReviewPresentation } from './ManagePayScheduleReviewPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface ManagePayScheduleReviewProps extends BaseComponentInterface {
  companyId: string
  assignmentData: AssignmentData
}

export function ManagePayScheduleReview(props: ManagePayScheduleReviewProps) {
  useI18n('CompanyManagement.ManagePayScheduleReview')
  useComponentDictionary('CompanyManagement.ManagePayScheduleReview', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, assignmentData }: ManagePayScheduleReviewProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const [preview, setPreview] = useState<PayScheduleAssignmentPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { mutateAsync: previewAssignment } = usePaySchedulesPreviewAssignmentMutation()
  const { mutateAsync: assignPaySchedules, isPending: isSubmitting } =
    usePaySchedulesAssignMutation()

  const normalizedAssignmentData = useMemo(
    () => normalizeAssignmentData(assignmentData),
    [assignmentData],
  )

  useEffect(() => {
    const fetchPreview = async () => {
      setIsLoading(true)
      try {
        const requestBody = buildAssignmentRequestBody(normalizedAssignmentData)
        const result = await previewAssignment({
          request: {
            companyId,
            payScheduleAssignmentBody: requestBody,
          },
        })
        setPreview(result.payScheduleAssignmentPreview ?? null)
      } catch {
        setPreview(null)
      } finally {
        setIsLoading(false)
      }
    }
    void fetchPreview()
  }, [companyId, normalizedAssignmentData, previewAssignment])

  const handleConfirm = async () => {
    await baseSubmitHandler({}, async () => {
      const requestBody = buildAssignmentRequestBody(normalizedAssignmentData)
      await assignPaySchedules({
        request: {
          companyId,
          payScheduleAssignmentBody: requestBody,
        },
      })
      onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CONFIRMED, normalizedAssignmentData)
    })
  }

  const handleBack = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_BACK)
  }

  return (
    <ManagePayScheduleReviewPresentation
      preview={preview}
      assignmentType={normalizedAssignmentData.type}
      departmentsList={normalizedAssignmentData.departmentsList}
      employeesList={normalizedAssignmentData.employeesList}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onConfirm={handleConfirm}
      onBack={handleBack}
    />
  )
}

function normalizeAssignmentData(data: AssignmentData): AssignmentData {
  const { type } = data

  if (type === PayScheduleAssignmentBodyType.HourlySalaried) {
    if (data.hourlyPayScheduleUuid && data.hourlyPayScheduleUuid === data.salariedPayScheduleUuid) {
      return {
        ...data,
        type: PayScheduleAssignmentBodyType.Single,
        defaultPayScheduleUuid: data.hourlyPayScheduleUuid,
        hourlyPayScheduleUuid: undefined,
        salariedPayScheduleUuid: undefined,
      }
    }
  }

  if (type === PayScheduleAssignmentBodyType.ByEmployee) {
    const employees = data.employees ?? []
    const firstSchedule = employees[0]?.payScheduleUuid
    if (employees.length > 0 && firstSchedule) {
      const allSameSchedule = employees.every(e => e.payScheduleUuid === firstSchedule)
      if (allSameSchedule) {
        return {
          ...data,
          type: PayScheduleAssignmentBodyType.Single,
          defaultPayScheduleUuid: firstSchedule,
          employees: undefined,
        }
      }
    }
  }

  if (type === PayScheduleAssignmentBodyType.ByDepartment) {
    const departments = data.departments ?? []
    const defaultSchedule = data.defaultPayScheduleUuid
    if (departments.length > 0 && defaultSchedule) {
      const allSameSchedule = departments.every(d => d.payScheduleUuid === defaultSchedule)
      if (allSameSchedule) {
        return {
          ...data,
          type: PayScheduleAssignmentBodyType.Single,
          departments: undefined,
        }
      }
    }
  }

  return data
}

function buildAssignmentRequestBody(assignmentData: AssignmentData): PayScheduleAssignmentBody {
  return {
    type: assignmentData.type,
    defaultPayScheduleUuid: assignmentData.defaultPayScheduleUuid,
    hourlyPayScheduleUuid: assignmentData.hourlyPayScheduleUuid,
    salariedPayScheduleUuid: assignmentData.salariedPayScheduleUuid,
    employees: assignmentData.employees,
    departments: assignmentData.departments,
  }
}
