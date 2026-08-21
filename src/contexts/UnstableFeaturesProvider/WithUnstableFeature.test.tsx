import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { WithUnstableFeature } from './WithUnstableFeature'
import { UnstableFeaturesContext, type UnstableFeatures } from './useUnstableFeature'

/**
 * `UnstableFeatures` may have no active flags at any given time (and its real flags change as
 * features graduate), so these tests exercise the generic gating mechanics against a stand-in flag
 * layered on top of the real type. Real flags are `Partial` here — on purpose — so these tests
 * never need to know about or supply whatever real flags currently exist.
 *
 * Deliberately not a `declare module` augmentation of the real `UnstableFeatures` interface:
 * module augmentation merges into the type for the whole program, so a stand-in flag declared that
 * way would leak into every other file's view of `UnstableFeatures`, not just this test file.
 */
interface TestFlags extends Partial<UnstableFeatures> {
  exampleFlag?: boolean
}

const asTestFeatures = (flags: TestFlags): UnstableFeatures => flags

// keyof UnstableFeatures is `never` while the interface is empty, so this cast is unavoidable.
const asTestFeatureKey = (key: keyof TestFlags): keyof UnstableFeatures =>
  key as unknown as keyof UnstableFeatures

const EXAMPLE_FLAG = asTestFeatureKey('exampleFlag')

describe('WithUnstableFeature', () => {
  test('renders children when the flag is enabled', () => {
    render(
      <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: true })}>
        <WithUnstableFeature feature={EXAMPLE_FLAG}>
          <div>alpha content</div>
        </WithUnstableFeature>
      </UnstableFeaturesContext.Provider>,
    )

    expect(screen.getByText('alpha content')).toBeInTheDocument()
  })

  test('renders nothing when the flag is disabled', () => {
    render(
      <UnstableFeaturesContext.Provider value={asTestFeatures({ exampleFlag: false })}>
        <WithUnstableFeature feature={EXAMPLE_FLAG}>
          <div>alpha content</div>
        </WithUnstableFeature>
      </UnstableFeaturesContext.Provider>,
    )

    expect(screen.queryByText('alpha content')).not.toBeInTheDocument()
  })

  test('renders nothing when no provider is present', () => {
    render(
      <WithUnstableFeature feature={EXAMPLE_FLAG}>
        <div>alpha content</div>
      </WithUnstableFeature>,
    )

    expect(screen.queryByText('alpha content')).not.toBeInTheDocument()
  })
})
