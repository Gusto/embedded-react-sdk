import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useTranslation } from 'react-i18next'
import { useContractorsDeleteMutation } from '@gusto/embedded-api/react-query/contractorsDelete'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useContractors } from './useContractorList'
import { ActionsLayout, DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { firstLastName } from '@/helpers/formattedStrings'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import type { MenuItem } from '@/components/Common/UI/Menu/MenuTypes'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import { useI18n, useComponentDictionary } from '@/i18n'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents, CONTRACTOR_TYPE, ContractorOnboardingStatus } from '@/shared/constants'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import XCircleSvg from '@/assets/icons/x-circle.svg?react'

interface HeadProps {
  count: number
  handleAdd: () => void
}
function Head({ count, handleAdd }: HeadProps) {
  const { Button, Heading } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorList')

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Heading as="h2">{t('title')}</Heading>

      {count !== 0 && (
        <Button variant="secondary" onClick={handleAdd}>
          {t('addAnotherCta')}
        </Button>
      )}
    </Flex>
  )
}

interface EmptyDataContractorsListProps {
  handleAdd: () => void
}
function EmptyDataContractorsList({ handleAdd }: EmptyDataContractorsListProps) {
  const { Button } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorList')

  return (
    <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
      <ActionsLayout justifyContent="center">
        <Button onClick={handleAdd}>{t('addContractorCta')}</Button>
      </ActionsLayout>
    </EmptyData>
  )
}

/**
 * Props for {@link ContractorList}.
 *
 * @public
 */
export interface ContractorListProps extends BaseComponentInterface<'Contractor.ContractorList'> {
  /** UUID of the company whose contractors should be listed. */
  companyId: string
  /** Success message to display in an alert above the list, typically after a create, update, or delete action. */
  successMessage?: string
}

/**
 * Lists a company's contractors with controls to add, edit, delete, cancel self-onboarding, and continue onboarding.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/create` | The add-contractor action was triggered. | — |
 * | `contractor/update` | A contractor row's edit action was triggered. | `{ contractorId: string }` |
 * | `contractor/deleted` | A contractor was successfully deleted. | `{ contractorId: string }` |
 * | `contractor/selfOnboarding/cancelled` | A contractor's self-onboarding was cancelled, reverting them to admin onboarding. | The updated `contractorOnboardingStatus` returned by the API. |
 * | `contractor/onboarding/continue` | The continue action was triggered to advance onboarding. | — |
 *
 * @param props - See {@link ContractorListProps}.
 * @returns The rendered contractor list.
 * @public
 */
export function ContractorList(props: ContractorListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, className, dictionary, successMessage }: ContractorListProps) {
  useI18n('Contractor.ContractorList')
  useComponentDictionary('Contractor.ContractorList', dictionary)
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
    itemsPerPage,
  } = useContractors({ companyUuid: companyId })
  const { mutateAsync: deleteContractorMutation, isPending: isPendingDelete } =
    useContractorsDeleteMutation()
  const { mutateAsync: updateOnboardingStatusMutation, isPending: isPendingCancel } =
    useContractorsUpdateOnboardingStatusMutation()

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
    itemMenu: contractor => {
      const isAwaitingSelfOnboardingReview =
        contractor.onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
      const editLabel = isAwaitingSelfOnboardingReview ? t('reviewCta') : t('editCta')
      const canCancelSelfOnboarding =
        contractor.onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_INVITED ||
        contractor.onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_STARTED

      // While the contractor is mid self-onboarding, editing is blocked: the
      // admin must first cancel self-onboarding. So the Edit item is omitted
      // whenever cancelling is available.
      const menuItems: MenuItem[] = []

      if (!canCancelSelfOnboarding) {
        menuItems.push({
          label: editLabel,
          icon: <PencilSvg aria-hidden />,
          onClick: () => {
            handleEdit(contractor.uuid)
          },
        })
      }

      if (canCancelSelfOnboarding) {
        menuItems.push({
          label: t('cancelSelfOnboardingCta'),
          icon: <XCircleSvg aria-hidden />,
          onClick: () => {
            void handleCancelSelfOnboarding(contractor.uuid)
          },
        })
      }

      menuItems.push({
        label: t('deleteCta'),
        icon: <TrashCanSvg aria-hidden />,
        onClick: () => {
          void handleDelete(contractor.uuid)
        },
      })

      return <HamburgerMenu items={menuItems} isLoading={isPendingDelete || isPendingCancel} />
    },
    emptyState: () => <EmptyDataContractorsList handleAdd={handleAdd} />,
    pagination: {
      handleNextPage,
      handleFirstPage,
      handleLastPage,
      handlePreviousPage,
      handleItemsPerPageChange,
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage,
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

  const handleCancelSelfOnboarding = async (uuid: string) => {
    await baseSubmitHandler(uuid, async payload => {
      const response = await updateOnboardingStatusMutation({
        request: {
          contractorUuid: payload,
          contractorOnboardingStatusUpdateRequestBody: {
            onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          },
        },
      })

      onEvent(
        componentEvents.CONTRACTOR_SELF_ONBOARDING_CANCELLED,
        response.contractorOnboardingStatus,
      )
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
