import type {
  InternalFieldLayoutProps,
  SharedFieldLayoutProps,
} from '../FieldLayout/FieldLayoutTypes'

/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * Shared layout props consumed by horizontally-laid-out form controls — label, description, error message, required state, and visual label hiding.
 *
 * @remarks
 * Extended by props interfaces for inline controls such as `CheckboxProps`, `RadioProps`, and `SwitchProps`.
 * Alias of {@link SharedFieldLayoutProps} — exposed as a distinct name to mirror the horizontal layout used by these controls.
 *
 * @public
 */
export interface SharedHorizontalFieldLayoutProps extends SharedFieldLayoutProps {}
/* eslint-enable @typescript-eslint/no-empty-object-type */

/**
 * Props for the {@link HorizontalFieldLayout} component.
 *
 * @internal
 */
export type HorizontalFieldLayoutProps = SharedHorizontalFieldLayoutProps & InternalFieldLayoutProps
