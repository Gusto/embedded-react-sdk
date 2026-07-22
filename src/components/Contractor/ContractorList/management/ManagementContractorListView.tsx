import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UseContractorListResult, ContractorWithActions } from '../shared/useContractorList'
import type { ContractorTab } from './ManagementContractorList'
import { DataView, EmptyData, useDataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import XCircleSvg from '@/assets/icons/x-circle.svg?react'
import EyeSvg from '@/assets/icons/eye.svg?react'
import SlashCircleSvg from '@/assets/icons/slash-circle.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import { firstLastName } from '@/helpers/formattedStrings'
import { normalizeToDate, formatDateLong, formatDateLongWithYear } from '@/helpers/dateFormatting'
import { CONTRACTOR_TYPE, ContractorOnboardingStatus } from '@/shared/constants'

/** @internal */
export interface ManagementContractorListViewProps extends Pick<
  Extract<UseContractorListResult, { isLoading: false }>,
  'pagination' | 'status'
> {
  contractors: ContractorWithActions[]
  isFetching: boolean
  selectedTab: ContractorTab
  onTabChange: (tab: ContractorTab) => void
  onEdit: (contractorId: string) => void
  onView: (contractorId: string) => void
  onDismiss: (contractorId: string) => void
  onRehire: (contractorId: string) => void
  onDelete: (contractorId: string) => Promise<void>
  onCancelSelfOnboarding: (contractorId: string) => Promise<void>
  onCancelDismissal: (contractorId: string) => Promise<void>
  onCancelRehire: (contractorId: string) => Promise<void>
  onAddContractor: () => void
}

function contractorDisplayName(contractor: ContractorWithActions) {
  return contractor.type === CONTRACTOR_TYPE.BUSINESS
    ? (contractor.businessName ?? '')
    : firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
}

function ContractorNameCell({ contractor }: { contractor: ContractorWithActions }) {
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={0}>
      <Components.Text size="sm" weight="medium">
        {contractorDisplayName(contractor)}
      </Components.Text>
      <Components.Text variant="supporting" size="sm">
        {contractor.type ?? '–'}
      </Components.Text>
    </Flex>
  )
}

function formatBadgeDate(dateStr: string): string {
  const date = normalizeToDate(dateStr)
  if (!date) return ''
  const isSameYear = date.getFullYear() === new Date().getFullYear()
  return isSameYear ? formatDateLong(date) : formatDateLongWithYear(date)
}

function isOnboardingEditReview(onboardingStatus?: string | null) {
  return (
    onboardingStatus === ContractorOnboardingStatus.ADMIN_ONBOARDING_REVIEW ||
    onboardingStatus === ContractorOnboardingStatus.SELF_ONBOARDING_REVIEW
  )
}

/** @internal */
export function ManagementContractorListView({
  contractors,
  isFetching,
  selectedTab,
  onTabChange,
  status,
  pagination,
  onEdit,
  onView,
  onDismiss,
  onRehire,
  onDelete,
  onCancelSelfOnboarding,
  onCancelDismissal,
  onCancelRehire,
  onAddContractor,
}: ManagementContractorListViewProps) {
  const { t } = useTranslation('Contractor.ManagementContractorList')
  const Components = useComponentContext()
  const [contractorToRemove, setContractorToRemove] = useState<string | null>(null)
  const [cancelAction, setCancelAction] = useState<{
    contractorId: string
    type: 'dismissal' | 'rehire'
  } | null>(null)

  const tabs = [
    { id: 'active', label: t('tabs.active'), content: null },
    { id: 'onboarding', label: t('tabs.onboarding'), content: null },
    { id: 'dismissed', label: t('tabs.dismissed'), content: null },
  ]

  const getColumns = () => {
    const nameColumn = {
      key: 'name',
      title: t('nameLabel'),
      render: (contractor: ContractorWithActions) => <ContractorNameCell contractor={contractor} />,
    }

    if (selectedTab === 'active') {
      return [
        nameColumn,
        {
          key: 'rate',
          title: t('rateLabel'),
          render: (contractor: ContractorWithActions) =>
            contractor.wageType === 'Hourly' && contractor.hourlyRate
              ? t('rateHourly', { rate: `$${contractor.hourlyRate}` })
              : (contractor.wageType ?? '–'),
        },
        {
          key: 'status',
          title: '',
          render: (contractor: ContractorWithActions) => {
            if (contractor.upcomingEmployment?.startDate) {
              return (
                <Components.Badge status="info">
                  {t('startsBadge', {
                    date: formatBadgeDate(contractor.upcomingEmployment.startDate),
                  })}
                </Components.Badge>
              )
            }
            if (contractor.dismissalDate) {
              return (
                <Components.Badge status="warning">
                  {t('lastDayBadge', { date: formatBadgeDate(contractor.dismissalDate) })}
                </Components.Badge>
              )
            }
            return null
          },
        },
      ]
    }

    if (selectedTab === 'onboarding') {
      return [
        nameColumn,
        {
          key: 'status',
          title: t('onboardingStatusLabel'),
          render: (contractor: ContractorWithActions) => (
            <Flex alignItems="center" gap={8}>
              <ContractorOnboardingStatusBadge
                onboarded={contractor.onboarded}
                onboardingStatus={contractor.onboardingStatus}
              />
              {contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED &&
                contractor.upcomingEmployment?.startDate && (
                  <Components.Badge status="info">
                    {t('startsBadge', {
                      date: formatBadgeDate(contractor.upcomingEmployment.startDate),
                    })}
                  </Components.Badge>
                )}
            </Flex>
          ),
        },
      ]
    }

    return [
      nameColumn,
      {
        key: 'dismissalDate',
        title: t('dismissalDateLabel'),
        render: (contractor: ContractorWithActions) =>
          contractor.dismissalDate ? formatBadgeDate(contractor.dismissalDate) : '–',
      },
    ]
  }

  const { ...dataViewProps } = useDataView({
    data: contractors,
    columns: getColumns(),
    itemMenu: contractor => {
      if (selectedTab === 'onboarding') {
        const menuItems = []

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
            label: t('removeCta'),
            onClick: () => {
              setContractorToRemove(contractor.uuid)
            },
            icon: <TrashCanSvg aria-hidden />,
          })
        }

        return (
          <Flex alignItems="center" justifyContent="flex-end" gap={4}>
            {contractor.allowedActions.includes('edit') && (
              <Components.Button
                variant="secondary"
                onClick={() => {
                  onEdit(contractor.uuid)
                }}
              >
                {isOnboardingEditReview(contractor.onboardingStatus)
                  ? t('reviewCta')
                  : t('continueCta')}
              </Components.Button>
            )}
            <HamburgerMenu items={menuItems} triggerLabel={t('hamburgerTitle')} />
          </Flex>
        )
      }

      const menuItems = []

      if (contractor.allowedActions.includes('view')) {
        menuItems.push({
          label: t('viewDetailsCta'),
          onClick: () => {
            onView(contractor.uuid)
          },
          icon: <EyeSvg aria-hidden />,
        })
      }

      if (contractor.allowedActions.includes('cancel_rehire')) {
        menuItems.push({
          label: t('cancelRehireCta'),
          onClick: () => {
            setCancelAction({ contractorId: contractor.uuid, type: 'rehire' })
          },
          icon: <XCircleSvg aria-hidden />,
        })
      }

      if (contractor.allowedActions.includes('cancel_dismissal')) {
        menuItems.push({
          label: t('cancelDismissalCta'),
          onClick: () => {
            setCancelAction({ contractorId: contractor.uuid, type: 'dismissal' })
          },
          icon: <XCircleSvg aria-hidden />,
        })
      }

      if (contractor.allowedActions.includes('dismiss')) {
        menuItems.push({
          label: t('dismissCta'),
          onClick: () => {
            onDismiss(contractor.uuid)
          },
          icon: <SlashCircleSvg aria-hidden />,
        })
      }

      if (contractor.allowedActions.includes('rehire')) {
        menuItems.push({
          label: t('rehireCta'),
          onClick: () => {
            onRehire(contractor.uuid)
          },
          icon: <PlusCircleIcon aria-hidden />,
        })
      }

      return <HamburgerMenu items={menuItems} triggerLabel={t('hamburgerTitle')} />
    },
    isFetching,
    pagination,
    emptyState: () => (
      <EmptyData
        title={t(`emptyState.${selectedTab}.title`)}
        description={t(`emptyState.${selectedTab}.description`)}
      />
    ),
  })

  return (
    <>
      <Flex flexDirection="column" gap={32}>
        <Flex justifyContent="space-between" alignItems="center">
          <Components.Heading as="h2">{t('title')}</Components.Heading>
          <Components.Button variant="secondary" onClick={onAddContractor}>
            {t('addContractorCta')}
          </Components.Button>
        </Flex>

        <Flex flexDirection="column" gap={0}>
          <Components.Tabs
            tabs={tabs}
            selectedId={selectedTab}
            onSelectionChange={id => {
              onTabChange(id as ContractorTab)
            }}
            aria-label={t('tabsLabel')}
          />

          <DataView label={t('contractorListLabel')} {...dataViewProps} />
        </Flex>
      </Flex>

      <Components.Dialog
        isOpen={!!contractorToRemove}
        onClose={() => {
          setContractorToRemove(null)
        }}
        onPrimaryActionClick={async () => {
          if (contractorToRemove) {
            try {
              await onDelete(contractorToRemove)
              setContractorToRemove(null)
            } catch {
              // Keep dialog open on error
            }
          }
        }}
        isPrimaryActionLoading={status.isPending}
        isDestructive
        title={t('removeDialog.title')}
        primaryActionLabel={t('removeDialog.confirmCta')}
        closeActionLabel={t('removeDialog.cancelCta')}
      >
        {t('removeDialog.description')}
      </Components.Dialog>

      <Components.Dialog
        isOpen={!!cancelAction}
        onClose={() => {
          setCancelAction(null)
        }}
        onPrimaryActionClick={async () => {
          if (!cancelAction) return
          try {
            if (cancelAction.type === 'rehire') {
              await onCancelRehire(cancelAction.contractorId)
            } else {
              await onCancelDismissal(cancelAction.contractorId)
            }
            setCancelAction(null)
          } catch {
            // Keep dialog open on error
          }
        }}
        isPrimaryActionLoading={status.isPending}
        title={
          cancelAction?.type === 'rehire'
            ? t('cancelRehireDialog.title')
            : t('cancelDismissalDialog.title')
        }
        primaryActionLabel={
          cancelAction?.type === 'rehire'
            ? t('cancelRehireDialog.confirmCta')
            : t('cancelDismissalDialog.confirmCta')
        }
        closeActionLabel={
          cancelAction?.type === 'rehire'
            ? t('cancelRehireDialog.cancelCta')
            : t('cancelDismissalDialog.cancelCta')
        }
      >
        {cancelAction?.type === 'rehire'
          ? t('cancelRehireDialog.description')
          : t('cancelDismissalDialog.description')}
      </Components.Dialog>
    </>
  )
}
