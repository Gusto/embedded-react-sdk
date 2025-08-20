import { FormProvider, useForm } from 'react-hook-form'
import { Flex, NumberInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'

interface PayrollEditEmployeeProps {
  onDone: () => void
}

export const PayrollEditEmployeePresentation = ({ onDone }: PayrollEditEmployeeProps) => {
  const { Button, Heading, Text } = useComponentContext()
  const formHandlers = useForm()
  return (
    <Flex flexDirection="column" gap={20}>
      <Heading as="h2">{`Edit Hannah Arendt's payroll`}</Heading>
      <Heading as="h1">$1,173.08</Heading>
      <Text>Gross pay</Text>
      <Heading as="h3">Regular hours</Heading>
      <FormProvider {...formHandlers}>
        <Form>
          <NumberInputField defaultValue={40} isRequired label="Hours" name="hours" />
        </Form>
      </FormProvider>

      <Button onClick={onDone} title="Done">
        Done
      </Button>
    </Flex>
  )
}
