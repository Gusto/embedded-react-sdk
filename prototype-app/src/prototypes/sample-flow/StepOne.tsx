import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'

export function StepOne() {
  const Components = useComponentContext()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [department, setDepartment] = useState('')

  return (
    <>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">Employee Information</Components.Heading>
        <Components.Text variant="supporting">
          Enter the new employee details below.
        </Components.Text>
      </Flex>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '24rem' }}>
        <Components.TextInput
          label="First name"
          placeholder="Jane"
          value={firstName}
          onChange={setFirstName}
        />
        <Components.TextInput
          label="Last name"
          placeholder="Doe"
          value={lastName}
          onChange={setLastName}
        />
        <Components.Select
          label="Department"
          options={[
            { value: 'engineering', label: 'Engineering' },
            { value: 'design', label: 'Design' },
            { value: 'product', label: 'Product' },
            { value: 'sales', label: 'Sales' },
          ]}
          value={department}
          onChange={setDepartment}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Components.Button variant="primary" onClick={() => navigate('/sample-flow/step-two')}>
          Continue
        </Components.Button>
      </div>
    </>
  )
}
