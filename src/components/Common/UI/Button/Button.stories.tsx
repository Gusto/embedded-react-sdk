import React from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Button',
}

// Main Button stories
export const Default = () => {
  const Components = useComponentContext()
  return <Components.Button>Button</Components.Button>
}

export const Loading = () => {
  const Components = useComponentContext()
  return <Components.Button isLoading>Loading Button</Components.Button>
}

export const Disabled = () => {
  const Components = useComponentContext()
  return <Components.Button isDisabled>Disabled Button</Components.Button>
}

// Grid view showing all variants and states
export const ButtonGrid = () => {
  const Components = useComponentContext()
  const states = [
    { label: 'Default', props: {} },
    { label: 'Loading', props: { isLoading: true } },
    { label: 'Disabled', props: { isDisabled: true } },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `auto repeat(${states.length}, 1fr)`,
        gap: '16px',
        padding: '24px',
        borderRadius: '8px',
        margin: '24px 0',
      }}
    >
      {/* Header row */}
      <div style={{ gridColumn: '1 / 1' }}></div>
      {states.map((state, idx) => (
        <div key={idx} style={{ textAlign: 'center', fontWeight: 'bold', paddingBottom: '16px' }}>
          {state.label}
        </div>
      ))}

      {/* Primary Button row */}
      <React.Fragment key="row-primary">
        <div key="label-primary" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Primary
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`primary-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.Button variant="primary" onClick={() => {}} {...state.props}>
              Primary
            </Components.Button>
          </div>
        ))}
      </React.Fragment>

      {/* Secondary Button row */}
      <React.Fragment key="row-secondary">
        <div key="label-secondary" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Secondary
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`secondary-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.Button variant="secondary" onClick={() => {}} {...state.props}>
              Secondary
            </Components.Button>
          </div>
        ))}
      </React.Fragment>

      {/* Tertiary Button row */}
      <React.Fragment key="row-tertiary">
        <div key="label-tertiary" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Tertiary
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`tertiary-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.Button variant="tertiary" onClick={() => {}} {...state.props}>
              Tertiary
            </Components.Button>
          </div>
        ))}
      </React.Fragment>

      {/* Error Button row */}
      <React.Fragment key="row-error">
        <div key="label-error" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Error
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`error-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.Button variant="error" onClick={() => {}} {...state.props}>
              Error
            </Components.Button>
          </div>
        ))}
      </React.Fragment>
    </div>
  )
}
