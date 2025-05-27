import type {
  InternalFieldLayoutProps,
  SharedFieldLayoutProps,
} from '../FieldLayout/FieldLayoutTypes'

export type SharedHorizontalFieldLayoutProps = SharedFieldLayoutProps

export type HorizontalFieldLayoutProps = SharedHorizontalFieldLayoutProps & InternalFieldLayoutProps
