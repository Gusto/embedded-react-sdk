import React, { useState } from 'react'
import type { ButtonProps } from './ButtonTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

// Adding a meta object for title
export default {
  title: 'UI/Components/Button(New)', // Creates nesting structure for UI components
}

// Wrapper component that uses the component context
const ButtonStory = ({ ...props }: ButtonProps) => {
  const Components = useComponentContext()
  const [interactionState, setInteractionState] = useState<
    | {
        'data-hovered'?: true
        'data-pressed'?: true
        'data-focus-visible'?: true
        isLoading?: true
        isDisabled?: true
        isError?: true
      }
    | undefined
  >(undefined)

  return (
    <>
      <style>
        {`
        .container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .controls {
          display: flex;
          gap: 8px;
        }
        .controls label {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        `}
      </style>
      <div className="container">
        <Components.Button {...props} {...interactionState} onClick={() => {}} />
        <div className="controls">
          <label>
            <input
              type="checkbox"
              onChange={e => {
                if (e.target.checked) {
                  setInteractionState({
                    ...interactionState,
                    'data-hovered': true,
                  })
                } else {
                  setInteractionState(
                    interactionState && {
                      ...interactionState,
                      'data-hovered': undefined,
                    },
                  )
                }
              }}
            />{' '}
            Hovered
          </label>
          <label>
            <input
              type="checkbox"
              onChange={e => {
                if (e.target.checked) {
                  setInteractionState({
                    ...interactionState,
                    'data-pressed': true,
                  })
                } else {
                  setInteractionState(
                    interactionState && {
                      ...interactionState,
                      'data-pressed': undefined,
                    },
                  )
                }
              }}
            />{' '}
            Pressed
          </label>
          <label>
            <input
              type="checkbox"
              onChange={e => {
                if (e.target.checked) {
                  setInteractionState({
                    ...interactionState,
                    'data-focus-visible': true,
                  })
                } else {
                  setInteractionState(
                    interactionState && {
                      ...interactionState,
                      'data-focus-visible': undefined,
                    },
                  )
                }
              }}
            />{' '}
            Focus
          </label>
        </div>
      </div>
    </>
  )
}

/**
 * Grid display of all button variants and states
 */
export const ButtonGrid = () => {
  // Column labels for the states
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

  // Row labels for the variants
  const variants = [
    { label: 'Primary', variant: 'primary' },
    { label: 'Secondary', variant: 'secondary' },
    { label: 'Tertiary', variant: 'tertiary' },
    { label: 'Link', variant: 'link' },
    { label: 'Icon', variant: 'icon' },
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

      {/* Button rows */}
      {variants.map((variant, variantIdx) => (
        <React.Fragment key={`row-${variantIdx}`}>
          <div key={`label-${variantIdx}`} style={{ fontWeight: 'bold', alignSelf: 'center' }}>
            {variant.label}
          </div>

          {states.map((state, stateIdx) => (
            <div
              key={`${variantIdx}-${stateIdx}`}
              style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}
            >
              <ButtonStory
                variant={variant.variant as ButtonProps['variant']}
                onClick={() => {}}
                {...state.props}
              >
                {variant.variant === 'icon' ? '↓' : variant.label}
              </ButtonStory>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

// Keep the individual button stories for reference
export const PrimaryButton = () => (
  <ButtonStory variant="primary" onClick={() => {}}>
    Primary
  </ButtonStory>
)

export const SecondaryButton = () => (
  <ButtonStory variant="secondary" onClick={() => {}}>
    Secondary
  </ButtonStory>
)

export const TertiaryButton = () => (
  <ButtonStory variant="tertiary" onClick={() => {}}>
    Tertiary
  </ButtonStory>
)

export const LinkButton = () => (
  <ButtonStory variant="link" onClick={() => {}}>
    Link
  </ButtonStory>
)

export const IconButton = () => (
  <ButtonStory variant="icon" onClick={() => {}}>
    Icon
  </ButtonStory>
)

export const PrimaryLoadingButton = () => (
  <ButtonStory variant="primary" isLoading={true} onClick={() => {}}>
    Loading
  </ButtonStory>
)

export const PrimaryErrorButton = () => (
  <ButtonStory variant="primary" isError={true} onClick={() => {}}>
    Error
  </ButtonStory>
)

export const PrimaryDisabledButton = () => (
  <ButtonStory variant="primary" isDisabled={true} onClick={() => {}}>
    Disabled
  </ButtonStory>
)

export const SecondaryLoadingButton = () => (
  <ButtonStory variant="secondary" isLoading={true} onClick={() => {}}>
    Loading
  </ButtonStory>
)

export const SecondaryErrorButton = () => (
  <ButtonStory variant="secondary" isError={true} onClick={() => {}}>
    Error
  </ButtonStory>
)

export const SecondaryDisabledButton = () => (
  <ButtonStory variant="secondary" isDisabled={true} onClick={() => {}}>
    Disabled
  </ButtonStory>
)

export const TertiaryLoadingButton = () => (
  <ButtonStory variant="tertiary" isLoading={true} onClick={() => {}}>
    Loading
  </ButtonStory>
)

export const TertiaryErrorButton = () => (
  <ButtonStory variant="tertiary" isError={true} onClick={() => {}}>
    Error
  </ButtonStory>
)

export const TertiaryDisabledButton = () => (
  <ButtonStory variant="tertiary" isDisabled={true} onClick={() => {}}>
    Disabled
  </ButtonStory>
)

export const LinkLoadingButton = () => (
  <ButtonStory variant="link" isLoading={true} onClick={() => {}}>
    Loading
  </ButtonStory>
)

export const LinkErrorButton = () => (
  <ButtonStory variant="link" isError={true} onClick={() => {}}>
    Error
  </ButtonStory>
)

export const LinkDisabledButton = () => (
  <ButtonStory variant="link" isDisabled={true} onClick={() => {}}>
    Disabled
  </ButtonStory>
)
