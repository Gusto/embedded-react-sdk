import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayrollEditEmployeeProps } from '../PayrollEditEmployee/PayrollEditEmployee'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import styles from './UNSTABLE_PayrollEditEmployee.module.scss'
import { componentEvents } from '@/shared/constants'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { firstLastName } from '@/helpers/formattedStrings'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

/**
 * In-development regular-rate-of-pay rebuild of {@link PayrollEditEmployee}.
 *
 * @remarks
 * Gated behind the `payrollRegularRateOfPay` unstable feature flag and not part of the public
 * SDK surface. `PayrollEditEmployee` renders this in place of the stable editor when the flag is
 * enabled. Currently a scaffold: the header, `Cancel`, and `Save` controls only. `Cancel` and
 * `Save` emit the same events as the stable component so the surrounding flow behaves identically.
 *
 * @internal
 */
export function UNSTABLE_PayrollEditEmployee(props: PayrollEditEmployeeProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  employeeId,
  companyId,
  payrollId,
  onEvent,
  dictionary,
}: PayrollEditEmployeeProps) => {
  useComponentDictionary('Payroll.UNSTABLE_PayrollEditEmployee', dictionary)
  useI18n('Payroll.UNSTABLE_PayrollEditEmployee')
  const { t } = useTranslation('Payroll.UNSTABLE_PayrollEditEmployee')

  const { LoadingIndicator } = useBase()
  const { Button, Heading, Text } = useComponentContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isSmallOrGreater = breakpoints.includes('small')

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const memoizedEmployeeId = useMemo(() => [employeeId], [employeeId])
  const { preparedPayroll, isLoading } = usePreparedPayrollData({
    companyId,
    payrollId,
    employeeUuids: memoizedEmployeeId,
  })

  const employee = employeeData.employee

  const onSave = () => {
    // TODO: Once the save mutation is wired up, emit the updated payroll returned by the update
    // response here instead of the current prepared payroll from the query.
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
      payrollPrepared: preparedPayroll,
      employee,
    })
  }

  const onCancel = () => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED)
  }

  if (isLoading || !employee) {
    return <LoadingIndicator />
  }

  const employeeName = firstLastName({
    first_name: employee.firstName,
    last_name: employee.lastName,
  })

  const actions = (
    <Flex
      flexDirection={isSmallOrGreater ? 'row' : 'column'}
      justifyContent={isSmallOrGreater ? 'flex-end' : 'normal'}
      alignItems={isSmallOrGreater ? 'flex-start' : 'stretch'}
      gap={12}
    >
      <Button variant="secondary" onClick={onCancel} title={t('cancelCta')}>
        {t('cancelCta')}
      </Button>
      <Button onClick={onSave} title={t('saveCta')}>
        {t('saveCta')}
      </Button>
    </Flex>
  )

  return (
    <div ref={containerRef} className={styles.container}>
      <Flex
        flexDirection={isSmallOrGreater ? 'row' : 'column'}
        justifyContent="space-between"
        alignItems={isSmallOrGreater ? 'flex-start' : 'stretch'}
        gap={12}
      >
        <Flex flexDirection="column" alignItems="stretch" gap={8}>
          <Heading as="h1" styledAs={isSmallOrGreater ? 'h2' : 'h4'}>
            {t('pageTitle', { employeeName })}
          </Heading>
          <Heading as="h2" styledAs="h3">
            {/* TODO: Gross pay calculation pending decision on client-side RRoP calculation. */}
            TODO: Gross pay calculation
          </Heading>
          <Text>{t('grossPayLabel')}</Text>
        </Flex>
        {isSmallOrGreater && actions}
      </Flex>
      {!isSmallOrGreater && actions}
    </div>
  )
}
