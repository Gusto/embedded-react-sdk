import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  useTimeOffPoliciesGetAllSuspense,
  invalidateAllTimeOffPoliciesGetAll,
} from '@gusto/embedded-api/react-query/timeOffPoliciesGetAll'
import { useTimeOffPoliciesDeactivateMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesDeactivate'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import {
  useHolidayPayPoliciesGet,
  invalidateAllHolidayPayPoliciesGet,
} from '@gusto/embedded-api/react-query/holidayPayPoliciesGet'
import { useHolidayPayPoliciesDeleteMutation } from '@gusto/embedded-api/react-query/holidayPayPoliciesDelete'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import type { TimeOffPolicy } from '@gusto/embedded-api/models/components/timeoffpolicy'
import { PolicyListPresentation } from './PolicyListPresentation'
import type { PolicyListItem } from './PolicyListTypes'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useErrorHandling } from '@/hooks/useErrorHandling'
import { componentEvents } from '@/shared/constants'
import { useI18n } from '@/i18n'

export interface PolicyListProps extends BaseComponentInterface<'Company.TimeOff.TimeOffPolicies'> {
  companyId: string
}

export function PolicyList({ FallbackComponent, ...props }: PolicyListProps) {
  return (
    <BaseBoundaries
      componentName="Company.TimeOff.TimeOffPolicies"
      FallbackComponent={FallbackComponent}
    >
      <Root {...props} />
    </BaseBoundaries>
  )
}

function Root({ companyId, onEvent }: PolicyListProps) {
  useI18n('Company.TimeOff.TimeOffPolicies')
  const { t } = useTranslation('Company.TimeOff.TimeOffPolicies')
  const queryClient = useQueryClient()

  const {
    baseSubmitHandler,
    error: submitError,
    setError,
  } = useBaseSubmit('Company.TimeOff.TimeOffPolicies')

  const [deleteSuccessAlert, setDeleteSuccessAlert] = useState<string | null>(null)
  const [isDeletingPolicyId, setIsDeletingPolicyId] = useState<string | null>(null)

  const { data: policiesData } = useTimeOffPoliciesGetAllSuspense({
    companyUuid: companyId,
  })
  const timeOffPolicies = policiesData.timeOffPolicies ?? []

  const holidayQuery = useHolidayPayPoliciesGet(
    { companyUuid: companyId },
    {
      throwOnError: (error: Error) => {
        if (error instanceof GustoEmbeddedError) {
          const status = error.httpMeta.response.status
          if (status === 204 || status === 404) {
            return false
          }
        }
        return true
      },
    },
  )
  const holidayPayPolicy = holidayQuery.data?.holidayPayPolicy

  const { data: employeesData } = useEmployeesListSuspense({
    companyId,
    terminated: false,
  })
  const totalActiveEmployees = employeesData.showEmployees?.length ?? 0

  const deactivatePolicyMutation = useTimeOffPoliciesDeactivateMutation()
  const deleteHolidayMutation = useHolidayPayPoliciesDeleteMutation()

  const errorHandling = useErrorHandling([holidayQuery], { error: submitError, setError })
  const isPending = deactivatePolicyMutation.isPending || deleteHolidayMutation.isPending

  const getEnrolledDisplay = (enrolledCount: number) => {
    if (enrolledCount > 0 && enrolledCount === totalActiveEmployees) {
      return t('allEmployeesLabel')
    } else if (enrolledCount > 0) {
      return t('employeeCount', { count: enrolledCount })
    }
    return t('enrolledDash')
  }

  const policies: PolicyListItem[] = timeOffPolicies.map((policy: TimeOffPolicy) => ({
    uuid: policy.uuid,
    name: policy.name,
    policyType: policy.policyType,
    isComplete: policy.complete ?? false,
    enrolledDisplay: getEnrolledDisplay(policy.employees.length),
  }))

  if (holidayPayPolicy) {
    policies.push({
      uuid: holidayPayPolicy.companyUuid,
      name: t('holidayPayPolicy'),
      policyType: 'holiday',
      isComplete: true,
      enrolledDisplay: getEnrolledDisplay(holidayPayPolicy.employees.length),
      isHoliday: true,
    })
  }

  const handleCreatePolicy = () => {
    onEvent(componentEvents.TIME_OFF_CREATE_POLICY)
  }

  const handleEditPolicy = (policy: PolicyListItem) => {
    onEvent(componentEvents.TIME_OFF_VIEW_POLICY, {
      policyId: policy.uuid,
      policyType: policy.policyType,
    })
  }

  const handleFinishSetup = (policy: PolicyListItem) => {
    onEvent(componentEvents.TIME_OFF_VIEW_POLICY, {
      policyId: policy.uuid,
      policyType: policy.policyType,
    })
  }

  const handleDeletePolicy = async (policy: PolicyListItem) => {
    setIsDeletingPolicyId(policy.uuid)
    await baseSubmitHandler({}, async () => {
      if (policy.isHoliday) {
        await deleteHolidayMutation.mutateAsync({
          request: { companyUuid: companyId },
        })
        await invalidateAllHolidayPayPoliciesGet(queryClient)
        setDeleteSuccessAlert(t('flash.holidayDeleted'))
      } else {
        await deactivatePolicyMutation.mutateAsync({
          request: { timeOffPolicyUuid: policy.uuid },
        })
        await invalidateAllTimeOffPoliciesGetAll(queryClient)
        setDeleteSuccessAlert(t('flash.policyDeleted', { name: policy.name }))
      }
    })
    setIsDeletingPolicyId(null)
  }

  return (
    <BaseLayout error={errorHandling.errors}>
      <PolicyListPresentation
        policies={policies}
        onCreatePolicy={handleCreatePolicy}
        onEditPolicy={handleEditPolicy}
        onFinishSetup={handleFinishSetup}
        onDeletePolicy={handleDeletePolicy}
        deleteSuccessAlert={deleteSuccessAlert}
        onDismissDeleteAlert={() => {
          setDeleteSuccessAlert(null)
        }}
        isDeletingPolicyId={isDeletingPolicyId}
        isPending={isPending}
      />
    </BaseLayout>
  )
}
