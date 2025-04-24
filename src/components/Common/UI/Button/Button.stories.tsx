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

export const Error = () => {
  const Components = useComponentContext()
  return <Components.Button isError>Error Button</Components.Button>
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
    { label: 'Hover', props: { 'data-hovered': true } },
    { label: 'Pressed', props: { 'data-pressed': true } },
    { label: 'Focus', props: { 'data-focus-visible': true } },
    { label: 'Loading', props: { isLoading: true } },
    { label: 'Disabled', props: { isDisabled: true } },
    { label: 'Error', props: { isError: true } },
    { label: 'Error + Disabled', props: { isError: true, isDisabled: true } },
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

      {/* Icon Button row */}
      <React.Fragment key="row-icon">
        <div key="label-icon" style={{ fontWeight: 'bold', alignSelf: 'center' }}>
          Icon
        </div>
        {states.map((state, stateIdx) => (
          <div
            key={`icon-${stateIdx}`}
            style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
          >
            <Components.ButtonIcon aria-label="test-label" onClick={() => {}} {...state.props}>
              ↓
            </Components.ButtonIcon>
          </div>
        ))}
      </React.Fragment>
    </div>
  )
}
