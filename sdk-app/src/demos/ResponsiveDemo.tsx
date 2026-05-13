import { useState } from 'react'
import { EmployeeOnboarding, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { BASE_URL, COMPANY_ID } from './config'

const widths = [400, 600, 800, 1000]

export default function ResponsiveDemo() {
  const [width, setWidth] = useState(1000)

  return (
    <div>
      <div className="responsive-controls">
        <label>Container width:</label>
        {widths.map(w => (
          <button
            key={w}
            className={`responsive-btn ${width === w ? 'active' : ''}`}
            onClick={() => setWidth(w)}
          >
            {w}px
          </button>
        ))}
      </div>

      <div
        className="responsive-container"
        style={{ maxWidth: width, transition: 'max-width 300ms ease' }}
      >
        <GustoProvider config={{ baseUrl: BASE_URL }}>
          <EmployeeOnboarding.EmployeeList
            companyId={COMPANY_ID}
            onEvent={(eventType, data) => {
              console.log(eventType, data)
            }}
          />
        </GustoProvider>
      </div>
    </div>
  )
}
