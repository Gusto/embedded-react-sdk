import { useState } from 'react'
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, EMPLOYEE_ID } from './config'

export default function CompositionDemo() {
  const [started, setStarted] = useState(false)

  return (
    <GustoProvider config={{ baseUrl: BASE_URL }}>
      {!started ? (
        <div className="welcome-screen">
          <h2>Welcome!</h2>
          <p>
            Let&apos;s get your state tax information set up. This demonstrates using an individual
            SDK block composed with your own custom entry point.
          </p>
          <button className="welcome-cta" onClick={() => setStarted(true)}>
            Fill out your state taxes &rarr;
          </button>
        </div>
      ) : (
        <Employee.StateTaxes
          employeeId={EMPLOYEE_ID}
          onEvent={(eventType, data) => {
            console.log(eventType, data)
          }}
        />
      )}
    </GustoProvider>
  )
}
