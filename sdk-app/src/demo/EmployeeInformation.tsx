import { Suspense } from 'react'
import { BaseLayout } from '@/components/Base/Base'

interface EmployeeInformationProps {
  companyId: string
  employeeId: string
  onEvent: (event: string, payload?: unknown) => void
}

export function EmployeeInformation({
  companyId: _companyId,
  employeeId: _employeeId,
  onEvent: _onEvent,
}: EmployeeInformationProps) {
  return (
    <Suspense>
      <BaseLayout>Hello world</BaseLayout>
    </Suspense>
  )
}
