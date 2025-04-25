import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import { useCompensation } from './useCompensation'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const List = () => {
  const { employeeJobs, mode, isPending, handleEdit, handleDelete } = useCompensation()
  const { t } = useTranslation('Employee.Compensation')
  const Components = useComponentContext()

  if (mode !== 'LIST') {
    return
  }

  return (
    <>
      <Components.Table aria-label={t('allCompensations.tableLabel')}>
        <Components.TableHead>
          <Components.TableRow>
            <Components.TableHeader isRowHeader>
              {t('allCompensations.jobColumn')}
            </Components.TableHeader>
            <Components.TableHeader>{t('allCompensations.typeColumn')}</Components.TableHeader>
            <Components.TableHeader>{t('allCompensations.amountColumn')}</Components.TableHeader>
            <Components.TableHeader>{t('allCompensations.perColumn')}</Components.TableHeader>
            <Components.TableHeader>
              <VisuallyHidden>{t('allCompensations.actionColumn')}</VisuallyHidden>
            </Components.TableHeader>
          </Components.TableRow>
        </Components.TableHead>
        <Components.TableBody>
          {employeeJobs.map(job => {
            const flsaStatus = job.compensations?.find(
              comp => comp.uuid === job.currentCompensationUuid,
            )?.flsaStatus
            return (
              <Components.TableRow key={job.uuid}>
                <Components.TableCell>{job.title}</Components.TableCell>
                <Components.TableCell>
                  {flsaStatus !== undefined && t(`flsaStatusLabels.${flsaStatus}`)}
                </Components.TableCell>
                <Components.TableCell>{job.rate}</Components.TableCell>
                <Components.TableCell>{job.paymentUnit}</Components.TableCell>
                <Components.TableCell>
                  <Components.HamburgerMenu
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
                </Components.TableCell>
              </Components.TableRow>
            )
          })}
        </Components.TableBody>
      </Components.Table>
    </>
  )
}
