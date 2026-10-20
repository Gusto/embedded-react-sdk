import type { ErrorStateProps } from './ErrorStateTypes'
import styles from './ErrorState.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex'

/**
 * Renders a user-facing, recoverable error as the sole content of a surface, inside a {@link BoxProps | Box}.
 * Don't nest it inside another `Box`.
 *
 * @param props - The {@link ErrorStateProps} controlling the title, description, and action.
 * @returns The rendered error state.
 * @internal
 */
export function ErrorState({ title, description, action }: ErrorStateProps) {
  const Components = useComponentContext()

  return (
    <Components.Box>
      <div className={styles.root} role="alert" data-testid="error-state">
        <Flex flexDirection="column" alignItems="center" gap={16}>
          <div className={styles.textContent}>
            <Components.Heading as="h2" styledAs="h4" textAlign="center">
              {title}
            </Components.Heading>
            {description && (
              <Components.Text variant="supporting" textAlign="center">
                {description}
              </Components.Text>
            )}
          </div>
          {action && (
            <Components.Button variant="secondary" onClick={action.onClick}>
              {action.label}
            </Components.Button>
          )}
        </Flex>
      </div>
    </Components.Box>
  )
}
