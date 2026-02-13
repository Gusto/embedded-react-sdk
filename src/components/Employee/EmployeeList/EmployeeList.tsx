import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { EmployeeListProvider } from './useEmployeeList'
import { useEmployeeEmployeeList } from './useEmployeeEmployeeList'
import { Actions } from './Actions'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { Flex, Loading } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { Head } from '@/components/Employee/EmployeeList/Head'
import { List } from '@/components/Employee/EmployeeList/List'
import { useFlow } from '@/components/Flow/useFlow'

interface EmployeeListProps extends CommonComponentInterface<'Employee.EmployeeList'> {
  companyId: string
}

export function EmployeeList(props: EmployeeListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children, dictionary }: EmployeeListProps) {
  useI18n('Employee.EmployeeList')
  useComponentDictionary('Employee.EmployeeList', dictionary)

  const { data, actions, meta, pagination } = useEmployeeEmployeeList({ companyId })

  if (meta.isInitialLoading) {
    return <Loading />
  }

  return (
    <section className={className}>
      <EmployeeListProvider
        value={{
          handleEdit: actions.handleEdit,
          handleNew: actions.handleNew,
          handleReview: actions.handleReview,
          handleDelete: actions.handleDelete,
          employees: data.employees,
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalCount: pagination.totalCount,
          handleFirstPage: pagination.handleFirstPage,
          handlePreviousPage: pagination.handlePreviousPage,
          handleNextPage: pagination.handleNextPage,
          handleLastPage: pagination.handleLastPage,
          handleCancelSelfOnboarding: actions.handleCancelSelfOnboarding,
          handleItemsPerPageChange: pagination.handleItemsPerPageChange,
          handleSkip: actions.handleSkip,
          itemsPerPage: pagination.itemsPerPage,
          isFetching: meta.isFetching,
        }}
      >
        {children ? (
          children
        ) : (
          <Flex flexDirection="column">
            <Head />
            <List />
            <Actions />
          </Flex>
        )}
      </EmployeeListProvider>
    </section>
  )
}

export const EmployeeListContextual = () => {
  const { companyId, onEvent } = useFlow<OnboardingContextInterface>()
  return <EmployeeList companyId={companyId} onEvent={onEvent} />
}
