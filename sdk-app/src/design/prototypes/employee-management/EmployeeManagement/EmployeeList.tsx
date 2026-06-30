import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { useEmployeesList } from '@gusto/embedded-api-v-2026-06-15/react-query/employeesList'
import { useEmployeeEmploymentsDeleteRehireMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeEmploymentsDeleteRehire'
import type { EntityIds } from '../../../../useEntities'
import {
  EmployeeList as EmployeeListView,
  type EmployeeListTab,
} from '../../../components/employee/management/EmployeeList/EmployeeList'
import { BaseComponent } from '@/components/Base'

function tabToQueryParams(tab: EmployeeListTab, companyId: string) {
  const base = { companyId, page: 1, per: 25 }
  switch (tab) {
    case 'active':
      return { ...base, onboardedActive: true }
    case 'onboarding':
      return { ...base, onboarded: false }
    case 'dismissed':
      return { ...base, terminatedToday: true }
  }
}

function EmployeeListContent() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedTab, setSelectedTab] = useState<EmployeeListTab>('active')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const msg = searchParams.get('success')
    if (msg) {
      setSuccessMessage(msg)
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const queryParams = useMemo(
    () => tabToQueryParams(selectedTab, entities.companyId),
    [selectedTab, entities.companyId],
  )

  const { data, isPending } = useEmployeesList(queryParams)

  const { mutateAsync: deleteRehire } = useEmployeeEmploymentsDeleteRehireMutation()

  const { data: terminatedData } = useEmployeesList(
    { companyId: entities.companyId, page: 1, per: 25, terminated: true },
    { enabled: selectedTab === 'active' },
  )

  const pendingDismissals = useMemo(() => {
    if (selectedTab !== 'active') return []
    return (terminatedData?.showEmployees ?? []).filter(employee =>
      employee.terminations?.some(termination => {
        if (!termination.effectiveDate || termination.active === true) return false
        const effective = new Date(`${termination.effectiveDate}T00:00:00`)
        if (Number.isNaN(effective.getTime())) return false
        return effective.getTime() > Date.now()
      }),
    )
  }, [selectedTab, terminatedData])

  const employees = useMemo(() => {
    const primary = data?.showEmployees ?? []
    if (selectedTab !== 'active') return primary
    const seen = new Set(primary.map(e => e.uuid))
    return [...primary, ...pendingDismissals.filter(e => !seen.has(e.uuid))]
  }, [data, pendingDismissals, selectedTab])

  return (
    <EmployeeListView
      employees={employees}
      isFetching={isPending}
      selectedTab={selectedTab}
      onSelectTab={setSelectedTab}
      successMessage={successMessage}
      onDismissSuccess={() => {
        setSuccessMessage(null)
      }}
      onAddEmployee={() => {}}
      onEditEmployee={() => {}}
      onDismissEmployee={() => {}}
      onRehireEmployee={employee => {
        void navigate(`${employee.uuid}/rehire`)
      }}
      onViewEmployeeDetails={() => {}}
      onEditRehire={employee => {
        void navigate(`${employee.uuid}/rehire`)
      }}
      onCancelRehire={async employee => {
        await deleteRehire({ request: { employeeId: employee.uuid } })
        const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ') || 'employee'
        setSuccessMessage(`Rehire cancelled for ${name}`)
      }}
    />
  )
}

export function EmployeeList() {
  return (
    <BaseComponent onEvent={() => {}}>
      <EmployeeListContent />
    </BaseComponent>
  )
}
