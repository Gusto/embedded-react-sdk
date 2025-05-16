import { useTranslation } from 'react-i18next'
import { useCompensation } from './useCompensation'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { DataView, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'

export const List = () => {
  const { employeeJobs, mode, isPending, handleEdit, handleDelete } = useCompensation()
  const { t } = useTranslation('Employee.Compensation')

  const { ...dataViewProps } = useDataView({
    data: employeeJobs,
    columns: [
      {
        key: 'title',
        title: t('allCompensations.jobColumn'),
        render: (job: (typeof employeeJobs)[0]) => job.title || '',
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
        render: (job: (typeof employeeJobs)[0]) => job.rate?.toString() || '',
      },
      {
        key: 'paymentUnit',
        title: t('allCompensations.perColumn'),
        render: (job: (typeof employeeJobs)[0]) => job.paymentUnit || '',
      },
    ],
    itemMenu: (job: (typeof employeeJobs)[0]) => (
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
  })

  if (mode !== 'LIST') {
    return
  }

  return <DataView label={t('allCompensations.tableLabel')} {...dataViewProps} />
}
