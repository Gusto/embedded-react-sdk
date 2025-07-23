import React from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/ButtonIcon',
}

// Main ButtonIcon stories
export const Default = () => {
  const Components = useComponentContext()
  return (
    <Components.ButtonIcon aria-label="test-label" onClick={() => {}}>
      ↓
    </Components.ButtonIcon>
  )
}

export const Loading = () => {
  const Components = useComponentContext()
  return (
    <Components.ButtonIcon isLoading aria-label="test-label" onClick={() => {}}>
      ↓
    </Components.ButtonIcon>
  )
}

export const Disabled = () => {
  const Components = useComponentContext()
  return (
    <Components.ButtonIcon isDisabled aria-label="test-label" onClick={() => {}}>
      ↓
    </Components.ButtonIcon>
  )
}

// Grid view showing all variants and states
export const ButtonIconGrid = () => {
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

      {/* Primary ButtonIcon row */}
      <React.Fragment key="row-primary">
        <div key="label-primary" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Primary
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`primary-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.ButtonIcon
              variant="primary"
              aria-label="test-label"
              onClick={() => {}}
              {...state.props}
            >
              ↓
            </Components.ButtonIcon>
          </div>
        ))}
      </React.Fragment>

      {/* Secondary ButtonIcon row */}
      <React.Fragment key="row-secondary">
        <div key="label-secondary" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Secondary
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`secondary-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.ButtonIcon
              variant="secondary"
              aria-label="test-label"
              onClick={() => {}}
              {...state.props}
            >
              ↓
            </Components.ButtonIcon>
          </div>
        ))}
      </React.Fragment>

      {/* Tertiary ButtonIcon row */}
      <React.Fragment key="row-tertiary">
        <div key="label-tertiary" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Tertiary
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`tertiary-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.ButtonIcon
              variant="tertiary"
              aria-label="test-label"
              onClick={() => {}}
              {...state.props}
            >
              ↓
            </Components.ButtonIcon>
          </div>
        ))}
      </React.Fragment>

      {/* Error ButtonIcon row */}
      <React.Fragment key="row-error">
        <div key="label-error" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Error
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`error-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.ButtonIcon
              variant="error"
              aria-label="test-label"
              onClick={() => {}}
              {...state.props}
            >
              ↓
            </Components.ButtonIcon>
          </div>
        ))}
      </React.Fragment>
    </div>
  )
}
