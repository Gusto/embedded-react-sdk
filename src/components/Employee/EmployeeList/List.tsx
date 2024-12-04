import { EmptyData, Badge, Hamburger, HamburgerItem, Flex, Button } from '@/components/Common'
import { useEmployeeList } from '@/components/Employee/EmployeeList/EmployeeList'
import { Table, TableHeader, Column, TableBody, Row, Cell } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { VisuallyHidden } from 'react-aria'
import { useState } from 'react'
import classNames from 'classnames'

/**List of employees slot for EmployeeList component */
export const List = () => {
  const { handleDelete, employees, handleEdit, handleNew } = useEmployeeList()
  const { t } = useTranslation('Employee.EmployeeList')
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  return (
    <>
      <Table aria-label={t('employeeListLabel')}>
        <TableHeader>
          <Column isRowHeader>{t('nameLabel')}</Column>
          <Column>{t('statusLabel')}</Column>
          <Column>
            <VisuallyHidden>{t('actionLabel')}</VisuallyHidden>
          </Column>
        </TableHeader>
        <TableBody
          renderEmptyState={() => (
            <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
              <Button onPress={handleNew} variant="secondary">
                {t('addEmployeeCTA')}
              </Button>
            </EmptyData>
          )}
        >
          {employees.map(employee => (
            <Row
              key={employee.uuid}
              className={classNames('react-aria-Row', deleting.has(employee.uuid) && 'deleting')}
            >
              <Cell>{`${employee.last_name}, ${employee.first_name}`}</Cell>
              <Cell>
                <Badge
                  variant={employee.onboarded ? 'success' : 'warning'}
                  text={t(`onboardingStatus.${employee.onboarding_status ?? 'undefined'}`, {
                    ns: 'common',
                  })}
                />
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
                        setDeleting(prev => prev.add(employee.uuid))
                        void handleDelete(employee.uuid).then(() => {
                          setDeleting(prev => {
                            prev.delete(employee.uuid)
                            return prev
                          })
                        })
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
      {employees.length > 0 && (
        <Flex justifyContent="flex-end">
          <Button variant="secondary" onPress={handleNew}>
            {t('addAnotherCta')}
          </Button>
        </Flex>
      )}
    </>
  )
}
