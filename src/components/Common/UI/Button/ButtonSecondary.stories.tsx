import { useState } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

// Adding a meta object for title
export default {
  title: 'UI/Components/ButtonSecondary',
}

// Wrapper component that uses the component context
const ButtonStory = ({ ...props }) => {
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
        <Components.ButtonSecondary {...props} {...interactionState} onClick={() => {}} />
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

export const Default = () => <ButtonStory onClick={() => {}}>Secondary Button</ButtonStory>

export const Loading = () => (
  <ButtonStory isLoading onClick={() => {}}>
    Loading
  </ButtonStory>
)

export const Error = () => (
  <ButtonStory isError onClick={() => {}}>
    Error
  </ButtonStory>
)

export const Disabled = () => (
  <ButtonStory isDisabled onClick={() => {}}>
    Disabled
  </ButtonStory>
)
