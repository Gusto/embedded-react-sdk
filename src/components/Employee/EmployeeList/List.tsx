import { EmptyData, Badge, Hamburger, HamburgerItem, Flex, Button } from '@/components/Common'
import { useEmployeeList } from '@/components/Employee/EmployeeList/EmployeeList'
import { Table, TableHeader, Column, TableBody, Row, Cell } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { VisuallyHidden } from 'react-aria'
import { useState } from 'react'
import classNames from 'classnames'
import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'

/**List of employees slot for EmployeeList component */
export const List = () => {
  const {
    handleDelete,
    employees,
    handleEdit,
    handleReview,
    handleNew,
    handleCancelSelfOnboarding,
  } = useEmployeeList()
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
                  {employee.onboarding_status ===
                    EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
                  employee.onboarding_status ===
                    EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE ||
                  employee.onboarding_status ===
                    EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
                  employee.onboarding_status === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ? (
                    <HamburgerItem
                      icon={<PencilSvg aria-hidden />}
                      onAction={() => {
                        handleEdit(employee.uuid, employee.onboarding_status)
                      }}
                    >
                      {t('editCta')}
                    </HamburgerItem>
                  ) : null}
                  {/* @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses */}
                  {EmployeeSelfOnboardingStatuses.has(employee.onboarding_status ?? '') ? (
                    <HamburgerItem
                      icon={<PencilSvg aria-hidden />}
                      onAction={async () => {
                        await handleCancelSelfOnboarding(employee.uuid)
                      }}
                    >
                      {t('cancelSelfOnboardingCta')}
                    </HamburgerItem>
                  ) : null}
                  {employee.onboarding_status ===
                  EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE ? (
                    <HamburgerItem
                      icon={<PencilSvg aria-hidden />}
                      onAction={() => {
                        void handleReview(employee.uuid)
                      }}
                    >
                      {t('reviewCta')}
                    </HamburgerItem>
                  ) : null}

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
