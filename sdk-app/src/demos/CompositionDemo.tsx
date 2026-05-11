import { useState } from 'react'
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, EMPLOYEE_ID } from './config'

export default function CompositionDemo() {
  const [started, setStarted] = useState(false)

  return (
    <GustoProvider config={{ baseUrl: BASE_URL }}>
      {!started ? (
        <div
          className="welcome-screen"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <h2>Welcome!</h2>
          <p>
            Let&apos;s get your state tax information set up. This demonstrates using an individual
            SDK block composed with your own custom entry point.
          </p>
          <button
            className="welcome-cta"
            onClick={() => setStarted(true)}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 500,
              color: '#fff',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Fill out your state taxes &rarr;
          </button>
        </div>
      ) : (
        <Employee.Deductions
          employeeId={EMPLOYEE_ID}
          onEvent={(eventType, data) => {
            console.log(eventType, data)
          }}
        />
      )}
    </GustoProvider>
  )
}
