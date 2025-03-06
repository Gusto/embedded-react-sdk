import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import { usePaySchedule } from '../PaySchedule'
import { useDataView, DataView, Badge, Flex, Hamburger, HamburgerItem } from '@/components/Common'
import PencilSvg from '@/assets/icons/pencil.svg?react'

export const List = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const { paySchedules, mode, handleEdit } = usePaySchedule()
  const { ...dataViewProps } = useDataView({
    data: paySchedules || [],
    columns: [
      {
        title: t('payScheduleList.name'),
        key: 'custom_name',
        render: schedule => {
          const hasName = !!schedule.name
          let displayName = hasName ? schedule.name : schedule.custom_name
          if (displayName && displayName.length > 2) {
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
          }
          const displayFrequency = schedule.custom_name
          return (
            <Flex flexDirection={'column'} gap={0}>
              <div>{displayName}</div>
              {hasName && <div>{displayFrequency}</div>}
            </Flex>
          )
        },
      },
      {
        title: <VisuallyHidden>{t('payScheduleList.active')}</VisuallyHidden>,
        key: 'active',
        render: schedule => (
          <Flex alignItems={'center'} justifyContent={'center'}>
            {schedule.active ? (
              <Badge variant="success" text={t('payScheduleList.active')} />
            ) : (
              <Badge variant="info" text={t('payScheduleList.inactive')} />
            )}
          </Flex>
        ),
      },
      {
        title: <VisuallyHidden>{t('payScheduleList.actions')}</VisuallyHidden>,
        key: 'actions',
        render: schedule => {
          return (
            <Hamburger title="Actions">
              <HamburgerItem
                icon={<PencilSvg aria-hidden />}
                onAction={() => {
                  handleEdit(schedule)
                }}
              >
                {t('payScheduleList.edit')}
              </HamburgerItem>
            </Hamburger>
          )
        },
      },
    ],
  })

  if (mode !== 'LIST_PAY_SCHEDULES') {
    return null
  }

  return <DataView label="test" {...dataViewProps} />
}
