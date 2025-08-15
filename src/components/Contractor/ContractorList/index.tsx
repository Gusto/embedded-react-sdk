import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useTranslation } from 'react-i18next'
import { useContractorsDeleteMutation } from '@gusto/embedded-api/react-query/contractorsDelete'
import { useContractors } from './useContractorList'
import { ActionsLayout, DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { firstLastName } from '@/helpers/formattedStrings'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import { useI18n } from '@/i18n'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { componentEvents, CONTRACTOR_TYPE } from '@/shared/constants'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export interface HeadProps {
  count: number
  handleAdd: () => void
}
export function Head({ count, handleAdd }: HeadProps) {
  const { Button, Heading } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorList')

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Heading as="h2">{t('title')}</Heading>

      {count !== 0 && (
        <Button variant="secondary" onClick={handleAdd}>
          {t('addAnotherCTA')}
        </Button>
      )}
    </Flex>
  )
}

export interface EmptyDataContractorsListProps {
  handleAdd: () => void
}
export function EmptyDataContractorsList({ handleAdd }: EmptyDataContractorsListProps) {
  const { Button } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorList')

  return (
    <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
      <ActionsLayout justifyContent="center">
        <Button onClick={handleAdd}>{t('addContractorCTA')}</Button>
      </ActionsLayout>
    </EmptyData>
  )
}

export interface ContractorListProps extends CommonComponentInterface<'Contractor.ContractorList'> {
  companyId: string
  successMessage?: string
}

export function ContractorList(props: ContractorListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, className, dictionary, successMessage }: ContractorListProps) {
  useI18n('Contractor.ContractorList')
  const { t } = useTranslation('Contractor.ContractorList')
  const { onEvent, baseSubmitHandler } = useBase()
  const { Alert, Button } = useComponentContext()
  const {
    contractors,
    totalCount,
    handleNextPage,
    handleFirstPage,
    handleLastPage,
    handlePreviousPage,
    handleItemsPerPageChange,
    currentPage,
    totalPages,
  } = useContractors({ companyUuid: companyId })
  const { mutateAsync: deleteContractorMutation, isPending: isPendingDelete } =
    useContractorsDeleteMutation()

  const dataViewProps = useDataView<Contractor>({
    columns: [
      {
        title: t('listHeaders.name'),
        render: contractor =>
          contractor.type === CONTRACTOR_TYPE.BUSINESS
            ? contractor.businessName
            : firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName }),
      },
      {
        title: t('listHeaders.status'),
        render: ({ onboarded, onboardingStatus }) => (
          <ContractorOnboardingStatusBadge
            onboarded={onboarded}
            onboardingStatus={onboardingStatus}
          />
        ),
      },
    ],
    data: contractors,
    itemMenu: contractor => (
      <HamburgerMenu
        items={[
          {
            label: t('editCTA'),
            icon: <PencilSvg aria-hidden />,
            onClick: () => {
              handleEdit(contractor.uuid)
            },
          },
          {
            label: t('deleteCTA'),
            icon: <TrashCanSvg aria-hidden />,
            onClick: () => {
              void handleDelete(contractor.uuid)
            },
          },
        ]}
        triggerLabel={t('editCTA')}
        isLoading={isPendingDelete}
      />
    ),
    emptyState: () => <EmptyDataContractorsList handleAdd={handleAdd} />,
    pagination: {
      handleNextPage,
      handleFirstPage,
      handleLastPage,
      handlePreviousPage,
      handleItemsPerPageChange,
      currentPage,
      totalPages,
    },
  })

  const handleAdd = () => {
    onEvent(componentEvents.CONTRACTOR_CREATE)
  }

  const handleEdit = (uuid: string) => {
    onEvent(componentEvents.CONTRACTOR_UPDATE, { contractorId: uuid })
  }

  const handleContinue = () => {
    onEvent(componentEvents.CONTRACTOR_ONBOARDING_CONTINUE)
  }

  const handleDelete = async (uuid: string) => {
    await baseSubmitHandler(uuid, async payload => {
      await deleteContractorMutation({
        request: { contractorUuid: payload },
      })

      onEvent(componentEvents.CONTRACTOR_DELETED, { contractorId: payload })
    })
  }

  return (
    <section className={className}>
      {successMessage && <Alert label={successMessage} status="success" />}
      <Flex flexDirection="column">
        <Head count={totalCount} handleAdd={handleAdd} />
        <DataView label={t('contractorListLabel')} {...dataViewProps} />
        <ActionsLayout>
          <Button onClick={handleContinue} isLoading={false}>
            {t('continueCta')}
          </Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}
