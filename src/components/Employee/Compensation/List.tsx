import { useTranslation } from 'react-i18next'
import { useCompensation } from './useCompensation'
import { VisuallyHidden } from '@/components/Common'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'

export const List = () => {
  const { employeeJobs, mode, isPending, handleEdit, handleDelete } = useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()

  if (mode !== 'LIST') {
    return
  }

  const columns = [
    {
      key: 'title',
      title: t('allCompensations.jobColumn'),
      isRowHeader: true,
    },
    {
      key: 'flsaStatus',
      title: t('allCompensations.typeColumn'),
      render: (job: (typeof employeeJobs)[0]) => {
        const flsaStatus = job.compensations?.find(
          comp => comp.uuid === job.currentCompensationUuid,
        )?.flsaStatus
        return flsaStatus !== undefined ? t(`flsaStatusLabels.${flsaStatus}`) : null
      },
    },
    {
      key: 'rate',
      title: t('allCompensations.amountColumn'),
    },
    {
      key: 'paymentUnit',
      title: t('allCompensations.perColumn'),
    },
    {
      key: 'actions',
      title: <VisuallyHidden>{t('allCompensations.actionColumn')}</VisuallyHidden>,
      render: (job: (typeof employeeJobs)[0]) => (
        <HamburgerMenu
          triggerLabel={t('hamburgerTitle')}
          items={[
            {
              label: t('allCompensations.editCta'),
              icon: <PencilSvg aria-hidden />,
              onClick: () => {
                handleEdit(job.uuid)
              },
            },
            ...(!job.primary
              ? [
                  {
                    label: t('allCompensations.deleteCta'),
                    icon: <TrashCanSvg aria-hidden />,
                    onClick: () => {
                      handleDelete(job.uuid)
                    },
                  },
                ]
              : []),
          ]}
          isLoading={isPending}
        />
      ),
    },
  ]

  return (
    <>
      <Components.Table
        aria-label={t('allCompensations.tableLabel')}
        data={employeeJobs}
        columns={columns}
      />
    </>
  )
}
