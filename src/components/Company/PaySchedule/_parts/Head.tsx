import { Link } from 'react-aria-components'
import { Trans, useTranslation } from 'react-i18next'
import { usePaySchedule } from '../usePaySchedule'
import { Flex } from '@/components/Common'

// Head slot for PaySchedule component
export const Head = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const { mode } = usePaySchedule()
  let headingOutput: React.ReactElement = <></>

  switch (mode) {
    case 'LIST_PAY_SCHEDULES':
      headingOutput = (
        <>
          <h2>{t('headings.pageTitle')}</h2>
          <p>
            <Trans
              i18nKey={'listDescription'}
              t={t}
              components={{
                how_to_choose_schedule: <Link />,
              }}
            />
          </p>
          <p>
            <Trans
              i18nKey={'listDescription2'}
              t={t}
              components={{
                payment_law_doc: <Link />,
              }}
            />
          </p>
        </>
      )
      break
    case 'ADD_PAY_SCHEDULE':
      headingOutput = <h2>{t('headings.addPaySchedule')}</h2>
      break
    case 'EDIT_PAY_SCHEDULE':
      headingOutput = <h2>{t('headings.editPaySchedule')}</h2>
      break
    default:
  }

  return (
    <Flex justifyContent="space-between" flexDirection={'column'} gap={4}>
      <header>{headingOutput}</header>
    </Flex>
  )
}
