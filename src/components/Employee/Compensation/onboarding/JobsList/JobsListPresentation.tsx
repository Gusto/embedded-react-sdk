import { useTranslation } from 'react-i18next'
import { type Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { FlsaStatus } from '@/shared/constants'

/** @internal */
export interface JobsListPresentationProps {
  /** @internal */
  jobs: Job[]
  /** @internal */
  primaryFlsaStatus: string | undefined
  /** @internal */
  isPending: boolean
  /** @internal */
  onAdd: () => void
  /** @internal */
  onEdit: (jobId: string) => void
  /** @internal */
  onDelete: (jobId: string) => void
  /** @internal */
  onContinue: () => void
}

/** @internal */
export function JobsListPresentation({
  jobs,
  primaryFlsaStatus,
  isPending,
  onAdd,
  onEdit,
  onDelete,
  onContinue,
}: JobsListPresentationProps) {
  useI18n('Employee.Compensation')
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()

  const showAddAnotherJob = primaryFlsaStatus === FlsaStatus.NONEXEMPT

  const dataViewProps = useDataView({
    data: jobs,
    columns: [
      {
        key: 'title',
        title: t('allCompensations.jobColumn'),
        render: (job: Job) => {
          const currentComp = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
          return currentComp?.title || ''
        },
      },
      {
        key: 'flsaStatus',
        title: t('allCompensations.typeColumn'),
        render: (job: Job) => {
          const flsaStatus = job.compensations?.find(
            comp => comp.uuid === job.currentCompensationUuid,
          )?.flsaStatus
          return flsaStatus !== undefined ? t(`flsaStatusLabels.${flsaStatus}`) : null
        },
      },
      {
        key: 'rate',
        title: t('allCompensations.amountColumn'),
        render: (job: Job) => job.rate?.toString() || '',
      },
      {
        key: 'paymentUnit',
        title: t('allCompensations.perColumn'),
        render: (job: Job) => job.paymentUnit || '',
      },
    ],
    itemMenu: (job: Job) => (
      <HamburgerMenu
        triggerLabel={t('hamburgerTitle')}
        items={[
          {
            label: t('allCompensations.editCta'),
            icon: <PencilSvg aria-hidden />,
            onClick: () => {
              onEdit(job.uuid)
            },
          },
          ...(!job.primary
            ? [
                {
                  label: t('allCompensations.deleteCta'),
                  icon: <TrashCanSvg aria-hidden />,
                  onClick: () => {
                    onDelete(job.uuid)
                  },
                },
              ]
            : []),
        ]}
        isLoading={isPending}
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h2">{t('title')}</Components.Heading>
      <DataView
        data-testid="data-view"
        label={t('allCompensations.tableLabel')}
        {...dataViewProps}
      />
      <ActionsLayout>
        {showAddAnotherJob && (
          <Components.Button variant="secondary" onClick={onAdd} isDisabled={isPending}>
            {t('addAnotherJobCta')}
          </Components.Button>
        )}
        <Components.Button onClick={onContinue} isLoading={isPending}>
          {t('submitCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
