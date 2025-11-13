import type { PayrollSubmissionBlockersType } from '@gusto/embedded-api/models/components/payrollsubmissionblockerstype'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface GenericBlockerProps {
  blocker: PayrollSubmissionBlockersType
  selectedValue?: string
  onUnblockOptionChange: (blockerType: string, value: string) => void
}

export const GenericBlocker = ({
  blocker,
  selectedValue,
  onUnblockOptionChange,
}: GenericBlockerProps) => {
  const { Banner, Text, RadioGroup } = useComponentContext()
  const dateFormatter = useDateFormatter()
  const blockerType = blocker.blockerType || ''

  return (
    <Banner status="error" title={blocker.blockerName || 'Submission blocked'}>
      <Flex flexDirection="column" gap={16}>
        <Text>{blocker.blockerName || 'Please select an option to proceed.'}</Text>
        <RadioGroup
          label="Options"
          shouldVisuallyHideLabel
          options={
            blocker.unblockOptions?.map(option => ({
              value: option.unblockType || '',
              label: option.unblockType || '',
              description: option.checkDate
                ? `Check date: ${dateFormatter.formatShortWithYear(option.checkDate)}`
                : undefined,
            })) || []
          }
          value={selectedValue}
          onChange={value => {
            onUnblockOptionChange(blockerType, value)
          }}
        />
      </Flex>
    </Banner>
  )
}
