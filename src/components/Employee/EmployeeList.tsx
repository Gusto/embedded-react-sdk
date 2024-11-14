import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { Button, EmptyData, Flex, Hamburger, HamburgerItem } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Schemas } from '@/types'
import { useDeleteEmployee, useGetEmployeesByCompany } from '@/api/queries/company'
import { createCompoundContext } from '../Base/createCompoundContext'
import { useBase } from '../Base/useBase'
import { EmployeeListProvider, useEmployeeList } from './useEmployeeList'

//Interface for component specific props
interface EmployeeListProps extends CommonComponentInterface {
  companyId: string
}

export function EmployeeList(props: EmployeeListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children }: EmployeeListProps) {
  //Using i18n hook to directly load necessary namespace
  useI18n('Employee.EmployeeList')
  //Getting props from base context
  const { setError, onEvent } = useBase()
  const { data: employees } = useGetEmployeesByCompany(companyId)
  const { mutate: deleteEmployee } = useDeleteEmployee(companyId, {
    onSuccess: () => {
      onEvent(componentEvents.EMPLOYEE_DELETED)
    },
    onError: setError,
  })
  const handleNew = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleEdit = (uuid: string) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId: uuid })
  }
  return (
    <section className={className}>
      <EmployeeListProvider value={{ handleEdit, handleNew, deleteEmployee, employees }}>
        {children ? (
          children
        ) : (
          <>
            <Head />
            <List />
          </>
        )}
      </EmployeeListProvider>
    </section>
  )
}

/** Head slot for EmployeeList component */
function Head() {
  const { handleNew } = useEmployeeList()
  const { t } = useTranslation('Employee.EmployeeList')
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <h1>{t('title')}</h1>
      <Button onPress={handleNew}>{t('addEmployeeCTA')}</Button>
    </Flex>
  )
}

/**List of employees slot for EmployeeList component */
function List() {
  const { deleteEmployee, employees, handleEdit } = useEmployeeList()
  const { t } = useTranslation('Employee.EmployeeList')
  return (
    <Table aria-label={t('employeeListLabel')}>
      <TableHeader>
        <Column isRowHeader>{t('nameLabel')}</Column>
        <Column>{t('statusLabel')}</Column>
        <Column>{t('actionLabel')}</Column>
      </TableHeader>
      <TableBody
        renderEmptyState={() => (
          <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
        )}
      >
        {employees.map(employee => (
          <Row key={employee.uuid}>
            <Cell>{`${employee.last_name}, ${employee.first_name}`}</Cell>
            <Cell>
              {t(`onboardingStatus.${employee.onboarding_status ?? 'undefined'}`, {
                ns: 'common',
              })}
            </Cell>
            <Cell>
              <Hamburger title={t('hamburgerTitle')}>
                <HamburgerItem
                  icon={<PencilSvg aria-hidden />}
                  onAction={() => {
                    handleEdit(employee.uuid)
                  }}
                >
                  {t('editCta')}
                </HamburgerItem>
                {!employee.onboarded && (
                  <HamburgerItem
                    icon={<TrashCanSvg aria-hidden />}
                    onAction={() => {
                      confirm('Are you sure?') && deleteEmployee(employee.uuid)
                    }}
                  >
                    {t('deleteCta')}
                  </HamburgerItem>
                )}
              </Hamburger>
            </Cell>
          </Row>
        ))}
      </TableBody>
    </Table>
  )
}
EmployeeList.Head = Head
EmployeeList.List = List

/**
 * Wrapper used inside Flows -> exposes flow context for required parameters
 */
export const EmployeeListContextual = () => {
  const { companyId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  return <EmployeeList companyId={companyId} onEvent={onEvent} />
}
