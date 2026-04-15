import { useNavigate } from 'react-router-dom'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function StepTwo() {
  const Components = useComponentContext()
  const navigate = useNavigate()

  return (
    <>
      <Components.Heading as="h2">Review</Components.Heading>
      <Components.Text>
        Review the employee information before submitting. In a real prototype, this page would
        display the data collected from previous steps.
      </Components.Text>

      <Components.Alert
        status="info"
        label="This is a placeholder review step. Replace this with your actual review UI."
      />

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Components.Button variant="secondary" onClick={() => navigate('/sample-flow/step-one')}>
          Back
        </Components.Button>
        <Components.Button variant="primary" onClick={() => navigate('/')}>
          Submit
        </Components.Button>
      </div>
    </>
  )
}
