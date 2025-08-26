import { usePayrollsSubmitMutation } from '@gusto/embedded-api/react-query/payrollsSubmit'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { componentEvents } from '@/shared/constants'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

interface PayrollOverviewProps extends BaseComponentInterface {
  companyId: string
  payrollId: string
}

export const PayrollOverview = ({
  companyId,
  onEvent,
  payrollId,
  ...baseProps
}: PayrollOverviewProps) => {
  const { mutateAsync } = usePayrollsSubmitMutation()

  const onEdit = () => {
    onEvent(componentEvents.RUN_PAYROLL_EDITED)
  }
  const onSubmit = async () => {
    const result = await mutateAsync({
      request: {
        companyId,
        payrollId,
        requestBody: {
          submissionBlockers: [],
        },
      },
    })
    onEvent(componentEvents.RUN_PAYROLL_SUBMITTED, result)
  }
  return (
    <BaseComponent {...baseProps} onEvent={onEvent}>
      <PayrollOverviewPresentation onEdit={onEdit} onSubmit={onSubmit} />
    </BaseComponent>
  )
}
