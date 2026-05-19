import { useState } from 'react'
import styles from './employeeCompensation.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

interface CompensationRow {
  id: string
  job: string
  wage: string
  payType: string
  startDate: string
}

const rows: CompensationRow[] = [
  {
    id: '1',
    job: 'Administrator',
    wage: '$20.00 per hour',
    payType: 'By the hour',
    startDate: 'April 5, 2019',
  },
  {
    id: '2',
    job: 'Administrative Supervisor',
    wage: '$35.00 per hour',
    payType: 'By the hour',
    startDate: 'May 1, 2019',
  },
]

interface PendingChange {
  id: string
  title: string
  date: string
  details: string[]
}

const initialPendingChanges: PendingChange[] = [
  {
    id: 'pending-1',
    title: 'Administrative Supervisor',
    date: 'May 24, 2026',
    details: [
      'Job title will change to Senior Administrator',
      'Wage will change to $26.00 per hour',
    ],
  },
  {
    id: 'pending-2',
    title: 'Key Holder',
    date: 'June 1, 2026',
    details: ['Alejandro will start this job on June 1, with a wage of $22.00 per hour'],
  },
]

export function EmployeeCompensation() {
  const Components = useComponentContext()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>(initialPendingChanges)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelledTitles, setCancelledTitles] = useState<string[]>([])

  const handleCancelChange = (change: PendingChange) => {
    setCancellingId(change.id)
    setTimeout(() => {
      setPendingChanges(prev => prev.filter(c => c.id !== change.id))
      setCancelledTitles(prev => [...prev, change.title])
      setCancellingId(null)
    }, 1500)
  }

  const dataViewProps = useDataView<CompensationRow>({
    data: rows,
    columns: [
      {
        key: 'job',
        title: 'Job',
        render: row => (
          <>
            <Components.Text size="sm" weight="medium">
              {row.job}
            </Components.Text>
            <Components.Text variant="supporting" size="sm">
              {row.wage}
            </Components.Text>
          </>
        ),
      },
      {
        key: 'payType',
        title: 'Pay type',
        render: row => row.payType,
      },
      {
        key: 'startDate',
        title: 'Start date',
        render: row => row.startDate,
      },
    ],
    itemMenu: row => (
      <HamburgerMenu
        triggerLabel={`Actions for ${row.job}`}
        items={[
          {
            label: 'Edit',
            icon: <PencilSvg aria-hidden />,
            onClick: () => {},
          },
          {
            label: 'Delete',
            icon: <TrashCanSvg aria-hidden />,
            onClick: () => {},
          },
        ]}
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Box
        withPadding={false}
        header={
          <Flex justifyContent="space-between" alignItems="center" gap={4}>
            <Components.Heading as="h3" styledAs="h4">
              Compensation
            </Components.Heading>
          </Flex>
        }
      >
        <div className={styles.alertContainer}>
          <Components.Alert
            label="There are multiple pending changes to Alejandro's compensation."
            status="warning"
          >
            <Components.Button
              variant="secondary"
              onClick={() => {
                setIsReviewOpen(true)
              }}
            >
              Review
            </Components.Button>
          </Components.Alert>
        </div>
        <DataView isWithinBox label="Compensation" {...dataViewProps} />
      </Components.Box>
      <Components.Modal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false)
        }}
        shouldCloseOnBackdropClick
        footer={
          <Flex justifyContent="flex-end" gap={8}>
            <Components.Button
              variant="secondary"
              onClick={() => {
                setIsReviewOpen(false)
              }}
            >
              Close
            </Components.Button>
          </Flex>
        }
      >
        <Flex flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h3" styledAs="h4">
              Review pending changes
            </Components.Heading>
            <Components.Text variant="supporting">
              Placeholder content describing the pending compensation changes for Alejandro.
            </Components.Text>
          </Flex>
          <Flex flexDirection="column" gap={20}>
            {cancelledTitles.map((title, index) => (
              <Components.Alert
                key={`cancelled-${index}`}
                label="Change cancelled"
                status="success"
                onDismiss={() => {}}
              />
            ))}
            {pendingChanges.map(change => (
              <Components.Box
                key={change.id}
                footer={
                  <Components.Button
                    variant="secondary"
                    isLoading={cancellingId === change.id}
                    onClick={() => {
                      handleCancelChange(change)
                    }}
                  >
                    {cancellingId === change.id ? 'Cancelling' : 'Cancel change'}
                  </Components.Button>
                }
              >
                <Flex flexDirection="column" gap={16}>
                  <Flex flexDirection="column" gap={0}>
                    <Components.Text weight="medium">{change.title}</Components.Text>
                    <Components.Text variant="supporting" size="sm">
                      {change.date}
                    </Components.Text>
                  </Flex>
                  <Flex flexDirection="column" gap={4}>
                    {change.details.map((detail, index) => (
                      <Components.Text key={index} size="sm">
                        {detail}
                      </Components.Text>
                    ))}
                  </Flex>
                </Flex>
              </Components.Box>
            ))}
          </Flex>
        </Flex>
      </Components.Modal>
    </Flex>
  )
}
