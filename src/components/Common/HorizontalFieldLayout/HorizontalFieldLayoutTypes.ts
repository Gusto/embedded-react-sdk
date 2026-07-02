import type {
  InternalFieldLayoutProps,
  SharedFieldLayoutProps,
} from '../FieldLayout/FieldLayoutTypes'

/**
 * Shared layout props consumed by horizontally-laid-out form controls — label, description, error message, required state, and visual label hiding.
 *
 * @remarks
 * Extended by props interfaces for inline controls such as `CheckboxProps`, `RadioProps`, and `SwitchProps`.
 * Alias of {@link SharedFieldLayoutProps} — exposed as a distinct name to mirror the horizontal layout used by these controls.
 *
 * @public
 * @interface
 * @group Utility types
 */
export type SharedHorizontalFieldLayoutProps = SharedFieldLayoutProps

/**
 * Props for the {@link HorizontalFieldLayout} component.
 *
 * @internal
 */
export type HorizontalFieldLayoutProps = SharedHorizontalFieldLayoutProps & InternalFieldLayoutProps
