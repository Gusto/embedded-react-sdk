import { VisuallyHidden } from 'react-aria'
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { useCompensation } from './useCompensation'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { Hamburger, HamburgerItem } from '@/components/Common'

export const List = () => {
  const { employeeJobs, mode, isPending, handleEdit, handleDelete } = useCompensation()
  const { t } = useTranslation('Employee.Compensation')

  if (mode !== 'LIST') {
    return
  }

  return (
    <>
      <Table aria-label={t('allCompensations.tableLabel')}>
        <TableHeader>
          <Column isRowHeader>{t('allCompensations.jobColumn')}</Column>
          <Column>{t('allCompensations.typeColumn')}</Column>
          <Column>{t('allCompensations.amountColumn')}</Column>
          <Column>{t('allCompensations.perColumn')}</Column>
          <Column>
            <VisuallyHidden>{t('allCompensations.actionColumn')}</VisuallyHidden>
          </Column>
        </TableHeader>
        <TableBody>
          {employeeJobs.map(job => {
            const flsaStatus = job.compensations?.find(
              comp => comp.uuid === job.currentCompensationUuid,
            )?.flsaStatus
            return (
              <Row key={job.uuid}>
                <Cell>{job.title}</Cell>
                <Cell>{flsaStatus !== undefined && t(`flsaStatusLabels.${flsaStatus}`)}</Cell>
                <Cell>{job.rate}</Cell>
                <Cell>{job.paymentUnit}</Cell>
                <Cell>
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
                </Cell>
              </Row>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}
