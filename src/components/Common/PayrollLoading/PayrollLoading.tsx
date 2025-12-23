import type { PayrollLoadingProps } from './PayrollLoadingTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

const DefaultPayrollLoading = ({ title, description }: PayrollLoadingProps) => {
  const { Heading, Text, LoadingSpinner } = useComponentContext()
  const { LoadingIndicator } = useLoadingIndicator()

  return (
    <LoadingIndicator>
      <Flex flexDirection="column" alignItems="center" gap={4}>
        <LoadingSpinner size="lg" />
        <Heading as="h4">{title}</Heading>
        {description && <Text>{description}</Text>}
      </Flex>
    </LoadingIndicator>
  )
}

export const PayrollLoading = (props: PayrollLoadingProps) => {
  const Components = useComponentContext()

  return Components.PayrollLoading ? (
    <Components.PayrollLoading {...props} />
  ) : (
    <DefaultPayrollLoading {...props} />
  )
}
