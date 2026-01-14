import { useState } from 'react'
import { usePaySchedulesPreviewAssignmentMutation } from '@gusto/embedded-api/react-query/paySchedulesPreviewAssignment'
import { usePaySchedulesAssignMutation } from '@gusto/embedded-api/react-query/paySchedulesAssign'
import type { PayScheduleAssignmentPreview } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import type { PayScheduleAssignmentBody } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
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

  useEffect(() => {
    const fetchPreview = async () => {
      setIsLoading(true)
      try {
        const requestBody = buildAssignmentRequestBody(assignmentData)
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
  }, [companyId, assignmentData, previewAssignment])

  const handleConfirm = async () => {
    await baseSubmitHandler({}, async () => {
      const requestBody = buildAssignmentRequestBody(assignmentData)
      await assignPaySchedules({
        request: {
          companyId,
          payScheduleAssignmentBody: requestBody,
        },
      })
      onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CONFIRMED, assignmentData)
    })
  }

  const handleBack = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_BACK)
  }

  return (
    <ManagePayScheduleReviewPresentation
      preview={preview}
      assignmentType={assignmentData.type}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onConfirm={handleConfirm}
      onBack={handleBack}
    />
  )
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
