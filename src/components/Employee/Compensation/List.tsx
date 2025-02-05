import { useTranslation } from 'react-i18next'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { DataView, Hamburger, HamburgerItem, useDataView } from '@/components/Common'
import { useCompensation } from './Compensation'

export const List = () => {
  const { employeeJobs, mode, isPending, handleEdit, handleDelete } = useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  const { ...dataViewProps } = useDataView({
    columns: [
      {
        key: 'title',
        title: t('allCompensations.jobColumn'),
      },
      {
        key: 'flsa_status',
        title: t('allCompensations.typeColumn'),
        render: job => {
          let returnNode = ''
          const flsaStatus = job.compensations?.find(
            comp => comp.uuid === job.current_compensation_uuid,
          )?.flsa_status

          if (flsaStatus !== undefined) {
            returnNode = t(`flsaStatusLabels.${flsaStatus}`)
          }

          return returnNode
        },
      },
      {
        key: 'rate',
        title: t('allCompensations.amountColumn'),
      },
      {
        key: 'payment_unit',
        title: t('allCompensations.perColumn'),
      },
    ],
    data: employeeJobs,
    itemMenu: job => {
      return (
        <Hamburger title={t('hamburgerTitle')} isPending={isPending}>
          <HamburgerItem
            icon={<PencilSvg aria-hidden />}
            onAction={() => {
              handleEdit(job.uuid)
            }}
          >
            {t('allCompensations.editCta')}
          </HamburgerItem>
          {!job.primary && (
            <HamburgerItem
              icon={<TrashCanSvg aria-hidden />}
              onAction={() => {
                handleDelete(job.uuid)
              }}
            >
              {t('allCompensations.deleteCta')}
            </HamburgerItem>
          )}
        </Hamburger>
      )
    },
  })

  if (mode !== 'LIST') {
    return
  }

  return <DataView label={t('allCompensations.tableLabel')} {...dataViewProps} />
}
