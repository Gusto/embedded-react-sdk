import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import type { PendingCompensationChange } from './getPendingCompensationChanges'
import { usePendingChangeDetailRenderer } from './usePendingChangeDetailRenderer'
import { PendingChangesReviewModal } from './PendingChangesReviewModal'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'
import { EmptyData } from '@/components/Common'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import { useFormatPayRate } from '@/helpers/formattedStrings'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

export interface CompensationCardProps {
  job?: Job
  pendingChanges: PendingCompensationChange[]
  hasMultipleJobs: boolean
  employeeFirstName: string | null | undefined
  cancellingCompensationUuid: string | null
  onEditCompensation?: () => void
  onAddJob?: () => void
  onCancelChange: (pendingChange: PendingCompensationChange) => void
}

export function CompensationCard({
  job,
  pendingChanges,
  hasMultipleJobs,
  employeeFirstName,
  cancellingCompensationUuid,
  onEditCompensation,
  onAddJob,
  onCancelChange,
}: CompensationCardProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const formatPayRate = useFormatPayRate()
  const renderDetail = usePendingChangeDetailRenderer(employeeFirstName)

  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const hasPendingChanges = pendingChanges.length > 0
  const showSummaryAlert = hasMultipleJobs && pendingChanges.length > 1
  const showInlineAlert = hasPendingChanges && !showSummaryAlert
  const nextChange = pendingChanges[0]

  return (
    <>
      <Components.Box
        withPadding={!!job}
        header={
          <Components.BoxHeader
            title={t('jobAndPay.compensation.title')}
            action={
              job ? (
                <Components.Button variant="secondary" onClick={onEditCompensation}>
                  {t('jobAndPay.compensation.editCta')}
                </Components.Button>
              ) : (
                <Components.Button variant="secondary" onClick={onAddJob} icon={<PlusCircleIcon />}>
                  {t('jobAndPay.compensation.addJobCta')}
                </Components.Button>
              )
            }
          />
        }
      >
        {job ? (
          <Flex flexDirection="column" gap={16}>
            {showInlineAlert && nextChange && (
              <Components.Alert
                status="warning"
                disableScrollIntoView
                label={
                  hasMultipleJobs
                    ? t('jobAndPay.compensation.pendingChange.alertLabelWithJob', {
                        jobTitle: nextChange.jobTitle,
                        date: formatDateLongWithYear(nextChange.effectiveDate),
                      })
                    : t('jobAndPay.compensation.pendingChange.alertLabel', {
                        date: formatDateLongWithYear(nextChange.effectiveDate),
                      })
                }
              >
                <Flex flexDirection="column" gap={12}>
                  <Components.UnorderedList
                    items={nextChange.details.map(detail => renderDetail(detail))}
                  />
                  <div>
                    <Components.Button
                      variant="secondary"
                      isLoading={cancellingCompensationUuid === nextChange.compensationUuid}
                      onClick={() => {
                        onCancelChange(nextChange)
                      }}
                    >
                      {t('jobAndPay.compensation.pendingChange.cancelCta')}
                    </Components.Button>
                  </div>
                </Flex>
              </Components.Alert>
            )}
            {showSummaryAlert && (
              <Components.Alert
                status="warning"
                disableScrollIntoView
                label={t('jobAndPay.compensation.pendingChange.summaryLabel', {
                  name: employeeFirstName ?? '',
                })}
                action={
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      setIsReviewOpen(true)
                    }}
                  >
                    {t('jobAndPay.compensation.pendingChange.reviewCta')}
                  </Components.Button>
                }
              />
            )}
            <Flex flexDirection="column" gap={12}>
              {job.title && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('jobAndPay.compensation.jobTitle')}
                  </Components.Text>
                  <Components.Text>{job.title}</Components.Text>
                </Flex>
              )}

              {job.paymentUnit && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('jobAndPay.compensation.type')}
                  </Components.Text>
                  <Components.Text>
                    {job.paymentUnit === 'Hour'
                      ? t('jobAndPay.compensation.types.hourly')
                      : job.paymentUnit === 'Salary' || job.paymentUnit === 'Year'
                        ? t('jobAndPay.compensation.types.salary')
                        : job.paymentUnit}
                  </Components.Text>
                </Flex>
              )}

              {job.rate && job.paymentUnit && typeof job.rate === 'number' && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('jobAndPay.compensation.wage')}
                  </Components.Text>
                  <Components.Text>{formatPayRate(job.rate, job.paymentUnit)}</Components.Text>
                </Flex>
              )}

              {job.hireDate && (
                <Flex flexDirection="column" gap={0}>
                  <Components.Text variant="supporting">
                    {t('jobAndPay.compensation.startDate')}
                  </Components.Text>
                  <Components.Text>{formatDateLongWithYear(job.hireDate)}</Components.Text>
                </Flex>
              )}
            </Flex>
          </Flex>
        ) : (
          <EmptyData
            title={t('jobAndPay.compensation.emptyState.title')}
            description={t('jobAndPay.compensation.emptyState.description')}
          />
        )}
      </Components.Box>
      <PendingChangesReviewModal
        isOpen={isReviewOpen}
        pendingChanges={pendingChanges}
        employeeFirstName={employeeFirstName}
        cancellingCompensationUuid={cancellingCompensationUuid}
        onClose={() => {
          setIsReviewOpen(false)
        }}
        onCancelChange={onCancelChange}
      />
    </>
  )
}
