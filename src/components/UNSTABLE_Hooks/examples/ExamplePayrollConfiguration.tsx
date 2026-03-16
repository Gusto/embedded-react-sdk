import {
  usePayrollConfiguration,
  type PayrollConfigurationReady,
  type EnrichedEmployeeCompensation,
} from '../hooks/usePayrollConfiguration'
import { Flex, FlexItem, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { formatHoursDisplay } from '@/components/Payroll/helpers'

const examplePayrollConfigurationEvents = {
  PAYROLL_CALCULATED: 'payroll_calculated',
  PAYROLL_CALCULATION_FAILED: 'payroll_calculation_failed',
  EMPLOYEE_SKIPPED: 'employee_skipped',
  EMPLOYEE_UNSKIPPED: 'employee_unskipped',
} as const

type ExamplePayrollConfigurationEvent =
  (typeof examplePayrollConfigurationEvents)[keyof typeof examplePayrollConfigurationEvents]

interface ExamplePayrollConfigurationProps {
  companyId: string
  payrollId: string
  onEvent?: (event: ExamplePayrollConfigurationEvent, data?: unknown) => void
}

export function ExamplePayrollConfiguration({
  companyId,
  payrollId,
  onEvent,
}: ExamplePayrollConfigurationProps) {
  return (
    <BaseBoundaries>
      <ExamplePayrollConfigurationRoot
        companyId={companyId}
        payrollId={payrollId}
        onEvent={onEvent}
      />
    </BaseBoundaries>
  )
}

function ExamplePayrollConfigurationRoot({
  companyId,
  payrollId,
  onEvent,
}: ExamplePayrollConfigurationProps) {
  const payrollConfiguration = usePayrollConfiguration({ companyId, payrollId })
  const Components = useComponentContext()

  if (payrollConfiguration.isLoading) {
    return <BaseLayout isLoading />
  }

  const {
    data,
    errors,
    isPendingCalculatePayroll,
    isPendingUpdateSkipEmployee,
    onCalculate,
    onSkipEmployee,
    onUnskipEmployee,
  } = payrollConfiguration

  const handleCalculate = async () => {
    await onCalculate()
    if (data.blockers.length === 0) {
      onEvent?.(examplePayrollConfigurationEvents.PAYROLL_CALCULATED, {
        payrollId,
      })
    }
  }

  const handleSkip = async (employeeUuid: string) => {
    const result = await onSkipEmployee(employeeUuid)
    onEvent?.(examplePayrollConfigurationEvents.EMPLOYEE_SKIPPED, {
      employeeUuid,
      payrollPrepared: result,
    })
  }

  const handleUnskip = async (employeeUuid: string) => {
    const result = await onUnskipEmployee(employeeUuid)
    onEvent?.(examplePayrollConfigurationEvents.EMPLOYEE_UNSKIPPED, {
      employeeUuid,
      payrollPrepared: result,
    })
  }

  return (
    <BaseLayout error={errors.error} fieldErrors={errors.fieldErrors}>
      <Flex flexDirection="column" gap={24}>
        <Flex justifyContent="space-between" alignItems="center">
          <FlexItem>
            <Components.Heading as="h1">Payroll Configuration</Components.Heading>
            {data.payPeriod?.startDate && data.payPeriod.endDate && (
              <Components.Text variant="supporting">
                {data.payPeriod.startDate} — {data.payPeriod.endDate}
                {data.isOffCycle && ' (Off-Cycle)'}
              </Components.Text>
            )}
          </FlexItem>
          <FlexItem>
            <Components.Button
              onClick={handleCalculate}
              isLoading={isPendingCalculatePayroll}
              isDisabled={data.blockers.length > 0 || isPendingUpdateSkipEmployee}
            >
              {isPendingCalculatePayroll ? 'Calculating...' : 'Calculate Payroll'}
            </Components.Button>
          </FlexItem>
        </Flex>

        {data.blockers.length > 0 && (
          <Components.Alert label="Payroll Blockers" status="warning">
            {data.blockers.map(blocker => (
              <div key={blocker.key}>{blocker.message ?? blocker.key}</div>
            ))}
          </Components.Alert>
        )}

        <EmployeeCompensationsList
          employeeCompensations={data.employeeCompensations}
          isPendingSkip={isPendingUpdateSkipEmployee}
          onSkip={handleSkip}
          onUnskip={handleUnskip}
        />

        <PaginationControls pagination={payrollConfiguration.pagination} />

        {data.totals && (
          <PayrollTotals
            grossPay={data.totals.grossPay}
            netPay={data.totals.netPay}
            employerTaxes={data.totals.employerTaxes}
          />
        )}
      </Flex>
    </BaseLayout>
  )
}

interface EmployeeCompensationsListProps {
  employeeCompensations: EnrichedEmployeeCompensation[]
  isPendingSkip: boolean
  onSkip: (employeeUuid: string) => void
  onUnskip: (employeeUuid: string) => void
}

function EmployeeCompensationsList({
  employeeCompensations,
  isPendingSkip,
  onSkip,
  onUnskip,
}: EmployeeCompensationsListProps) {
  const Components = useComponentContext()

  const headers = [
    { key: 'employee', content: 'Employee' },
    { key: 'hours', content: 'Hours' },
    { key: 'pto', content: 'PTO' },
    { key: 'additional', content: 'Additional' },
    { key: 'reimbursements', content: 'Reimbursements' },
    { key: 'grossPay', content: 'Gross Pay' },
    { key: 'actions', content: '' },
  ]

  const rows = employeeCompensations.map(ec => ({
    key: ec.employeeUuid,
    data: [
      {
        key: 'employee',
        content: (
          <Flex flexDirection="column" gap={2}>
            <Components.Text weight="bold">
              {ec.firstName} {ec.lastName}
            </Components.Text>
            {ec.excluded && <Components.Badge status="warning">Skipped</Components.Badge>}
          </Flex>
        ),
      },
      { key: 'hours', content: formatHoursDisplay(ec.totalHours) },
      { key: 'pto', content: formatHoursDisplay(ec.totalPtoHours) },
      { key: 'additional', content: formatNumberAsCurrency(ec.additionalEarnings) },
      { key: 'reimbursements', content: formatNumberAsCurrency(ec.reimbursements) },
      {
        key: 'grossPay',
        content: (
          <Components.Text weight="bold">{formatNumberAsCurrency(ec.grossPay)}</Components.Text>
        ),
      },
      {
        key: 'actions',
        content: (
          <Components.Button
            variant="secondary"
            isDisabled={isPendingSkip}
            onClick={() => {
              if (ec.excluded) {
                onUnskip(ec.employeeUuid)
              } else {
                onSkip(ec.employeeUuid)
              }
            }}
          >
            {ec.excluded ? 'Unskip' : 'Skip'}
          </Components.Button>
        ),
      },
    ],
  }))

  return <Components.Table aria-label="Employee compensations" headers={headers} rows={rows} />
}

interface PaginationControlsProps {
  pagination: PayrollConfigurationReady['pagination']
}

function PaginationControls({ pagination }: PaginationControlsProps) {
  const Components = useComponentContext()

  if (pagination.totalPages <= 1) return null

  return (
    <ActionsLayout>
      <Flex justifyContent="center" alignItems="center" gap={8}>
        <Components.Button
          variant="secondary"
          isDisabled={pagination.isFirstPage || pagination.isFetching}
          onClick={pagination.onPreviousPage}
        >
          Previous
        </Components.Button>
        <Components.Text variant="supporting">
          Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount}{' '}
          employees)
        </Components.Text>
        <Components.Button
          variant="secondary"
          isDisabled={pagination.isLastPage || pagination.isFetching}
          onClick={pagination.onNextPage}
        >
          Next
        </Components.Button>
      </Flex>
    </ActionsLayout>
  )
}

interface PayrollTotalsProps {
  grossPay?: string
  netPay?: string
  employerTaxes?: string
}

function PayrollTotals({ grossPay, netPay, employerTaxes }: PayrollTotalsProps) {
  const Components = useComponentContext()

  return (
    <Flex justifyContent="flex-end" gap={24}>
      {grossPay && (
        <Flex flexDirection="column" alignItems="flex-end">
          <Components.Text size="xs" variant="supporting">
            Total Gross Pay
          </Components.Text>
          <Components.Text weight="bold">
            {formatNumberAsCurrency(Number(grossPay))}
          </Components.Text>
        </Flex>
      )}
      {netPay && (
        <Flex flexDirection="column" alignItems="flex-end">
          <Components.Text size="xs" variant="supporting">
            Total Net Pay
          </Components.Text>
          <Components.Text weight="bold">{formatNumberAsCurrency(Number(netPay))}</Components.Text>
        </Flex>
      )}
      {employerTaxes && (
        <Flex flexDirection="column" alignItems="flex-end">
          <Components.Text size="xs" variant="supporting">
            Employer Taxes
          </Components.Text>
          <Components.Text weight="bold">
            {formatNumberAsCurrency(Number(employerTaxes))}
          </Components.Text>
        </Flex>
      )}
    </Flex>
  )
}
