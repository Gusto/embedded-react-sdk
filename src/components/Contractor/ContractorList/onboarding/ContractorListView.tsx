import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UseContractorListResult, ContractorWithActions } from '../shared/useContractorList'
import { DataView, EmptyData, ActionsLayout, useDataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import XCircleSvg from '@/assets/icons/x-circle.svg?react'
import { firstLastName } from '@/helpers/formattedStrings'
import { CONTRACTOR_TYPE, ContractorOnboardingStatus } from '@/shared/constants'

/** @internal */
export interface ContractorListViewProps extends Pick<
  Extract<UseContractorListResult, { isLoading: false }>,
  'pagination' | 'status'
> {
  contractors: ContractorWithActions[]
  isFetching: boolean
  successMessage?: string
  onEdit: (contractorId: string) => void
  onDelete: (contractorId: string) => Promise<void>
  onCancelSelfOnboarding: (contractorId: string) => Promise<void>
  onAddContractor: () => void
  onContinue: () => void
}

function contractorDisplayName(contractor: ContractorWithActions) {
  return contractor.type === CONTRACTOR_TYPE.BUSINESS
    ? contractor.businessName
    : firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
}

/** @internal */
export function ContractorListView({
  contractors,
  isFetching,
  pagination,
  status,
  successMessage,
  onEdit,
  onDelete,
  onCancelSelfOnboarding,
  onAddContractor,
  onContinue,
}: ContractorListViewProps) {
  const { t } = useTranslation('Contractor.ContractorList')
  const Components = useComponentContext()
  const [contractorToDelete, setContractorToDelete] = useState<string | null>(null)

  const { ...dataViewProps } = useDataView({
    data: contractors,
    columns: [
      {
        title: t('listHeaders.name'),
        render: (contractor: ContractorWithActions) => contractorDisplayName(contractor),
      },
      {
        title: t('listHeaders.status'),
        render: (contractor: ContractorWithActions) => (
          <ContractorOnboardingStatusBadge
            onboarded={contractor.onboarded}
            onboardingStatus={contractor.onboardingStatus}
          />
        ),
      },
    ],
    itemMenu: contractor => {
      const menuItems = []
      const isReview =
        contractor.onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW

      if (contractor.allowedActions.includes('edit')) {
        menuItems.push({
          label: isReview ? t('reviewCta') : t('editCta'),
          onClick: () => {
            onEdit(contractor.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (contractor.allowedActions.includes('cancel_self_onboarding')) {
        menuItems.push({
          label: t('cancelSelfOnboardingCta'),
          onClick: () => {
            void onCancelSelfOnboarding(contractor.uuid)
          },
          icon: <XCircleSvg aria-hidden />,
        })
      }

      if (contractor.allowedActions.includes('delete')) {
        menuItems.push({
          label: t('deleteCta'),
          onClick: () => {
            setContractorToDelete(contractor.uuid)
          },
          icon: <TrashCanSvg aria-hidden />,
        })
      }

      return <HamburgerMenu items={menuItems} />
    },
    isFetching,
    pagination,
    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
        <ActionsLayout justifyContent="center">
          <Components.Button onClick={onAddContractor}>{t('addContractorCta')}</Components.Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  return (
    <>
      <Flex flexDirection="column">
        {successMessage && <Components.Alert label={successMessage} status="success" />}

        <Flex alignItems="center" justifyContent="space-between">
          <Components.Heading as="h2">{t('title')}</Components.Heading>

          {contractors.length > 0 && (
            <Components.Button variant="secondary" onClick={onAddContractor}>
              {t('addAnotherCta')}
            </Components.Button>
          )}
        </Flex>

        <DataView label={t('contractorListLabel')} {...dataViewProps} />

        <ActionsLayout>
          <Components.Button onClick={onContinue}>{t('continueCta')}</Components.Button>
        </ActionsLayout>
      </Flex>

      <Components.Dialog
        isOpen={!!contractorToDelete}
        onClose={() => {
          setContractorToDelete(null)
        }}
        onPrimaryActionClick={async () => {
          if (contractorToDelete) {
            try {
              await onDelete(contractorToDelete)
              setContractorToDelete(null)
            } catch {
              // Keep dialog open on error
            }
          }
        }}
        isPrimaryActionLoading={status.isPending}
        isDestructive
        title={t('deleteDialog.title')}
        primaryActionLabel={t('deleteDialog.confirmCta')}
        closeActionLabel={t('deleteDialog.cancelCta')}
      >
        {t('deleteDialog.description')}
      </Components.Dialog>
    </>
  )
}
