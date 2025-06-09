# Accessibility Testing Utilities

This directory contains reusable accessibility testing utilities that are globally available in all test files without needing imports.

## Available Global Functions

All functions are available globally in test files - no imports required!

### `expectNoAxeViolations(container, options?)`

Runs axe accessibility tests and **asserts there are no violations**. Use this for most accessibility tests.

```typescript
it('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  await expectNoAxeViolations(container)
})
```

### `runAxe(container, options?)`

Runs axe accessibility tests and **returns the raw results**. Use when you need to inspect results programmatically.

```typescript
it('should analyze accessibility', async () => {
  const { container } = render(<MyComponent />)
  const results = await runAxe(container)

  // Custom analysis of results
  expect(results.violations.length).toBe(0)
  expect(results.passes.length).toBeGreaterThan(0)
})
```

### `runAxeAndLog(container, options?, testName?)`

Runs axe accessibility tests and **logs violations without failing the test**. Use for discovery/monitoring during development.

```typescript
it('should log any accessibility issues', async () => {
  const { container } = render(<MyComponent />)
  await runAxeAndLog(container, {}, 'MyComponent test')
  // Test continues even if violations are found (they're just logged)
})
```

### Helper Functions for @testing-library/react

For convenience with `renderWithProviders()` and `render()` results:

#### `expectNoAxeViolationsOnRender(renderResult, options?)`

```typescript
it('should be accessible', async () => {
  const renderResult = renderWithProviders(<MyComponent />)
  await expectNoAxeViolationsOnRender(renderResult)
})
```

#### `runAxeOnRender(renderResult, options?)`

```typescript
it('should return axe results', async () => {
  const renderResult = renderWithProviders(<MyComponent />)
  const results = await runAxeOnRender(renderResult)
  // Analyze results...
})
```

#### `runAxeAndLogOnRender(renderResult, options?, testName?)`

```typescript
it('should log accessibility issues', async () => {
  const renderResult = renderWithProviders(<MyComponent />)
  await runAxeAndLogOnRender(renderResult, {}, 'MyComponent')
})
```

## Configuration Options

All functions accept an optional `AxeTestOptions` parameter:

```typescript
interface AxeTestOptions {
  /** Custom rules to override defaults */
  rules?: { [ruleId: string]: { enabled: boolean } }
  /** Whether to use integration test defaults (more permissive) */
  isIntegrationTest?: boolean
  /** Custom axe context */
  context?: ElementContext
  /** Custom axe options */
  options?: Omit<RunOptions, 'rules'>
}
```

### Default Rule Configuration

**Component Tests** (default):

```typescript
{
  'color-contrast': { enabled: false } // Often disabled due to design system isolation
}
```

**Integration Tests** (`isIntegrationTest: true`):

```typescript
{
  'color-contrast': { enabled: false },
  'page-has-heading-one': { enabled: false }, // Component testing context
  'region': { enabled: false } // Component testing context
}
```

## Usage Examples

### Basic Component Testing

```typescript
describe('MyComponent', () => {
  it('should be accessible', async () => {
    const { container } = renderWithProviders(<MyComponent />)
    await expectNoAxeViolations(container)
  })
})
```

### Parameterized Accessibility Tests

```typescript
describe('Accessibility', () => {
  const testCases = [
    { name: 'default state', props: {} },
    { name: 'disabled state', props: { disabled: true } },
    { name: 'error state', props: { error: 'Invalid input' } },
  ]

  it.each(testCases)(
    'should not have violations - $name',
    async ({ props }) => {
      const { container } = renderWithProviders(<MyComponent {...props} />)
      await expectNoAxeViolations(container)
    }
  )
})
```

### Custom Rule Configuration

```typescript
it('should be accessible with custom rules', async () => {
  const { container } = renderWithProviders(<MyComponent />)

  await expectNoAxeViolations(container, {
    rules: {
      'color-contrast': { enabled: true }, // Enable contrast checking
      'focus-order-semantics': { enabled: false }, // Disable focus order
    }
  })
})
```

### Integration Testing

```typescript
it('should be accessible as integration test', async () => {
  const { container } = render(
    <Provider>
      <ComplexForm />
    </Provider>
  )

  await expectNoAxeViolations(container, {
    isIntegrationTest: true // Uses more permissive rules
  })
})
```

### Discovery/Monitoring Mode

```typescript
it('should check accessibility (discovery)', async () => {
  const { container } = renderWithProviders(<ExperimentalComponent />)

  // This will log violations but won't fail the test
  await runAxeAndLog(container, {}, 'ExperimentalComponent')

  // Other assertions continue...
  expect(container).toHaveTextContent('Expected content')
})
```

### Advanced Usage with Results Analysis

```typescript
it('should have specific accessibility characteristics', async () => {
  const { container } = renderWithProviders(<DataTable />)
  const results = await runAxe(container)

  // Assert no violations
  expect(results.violations).toHaveLength(0)

  // Verify specific ARIA roles are present
  const tableRoles = results.passes.filter(pass =>
    pass.id === 'aria-roles' &&
    pass.nodes.some(node => node.html.includes('role="table"'))
  )
  expect(tableRoles.length).toBeGreaterThan(0)
})
```

## Migration from Old Patterns

### Before (individual runAxe functions)

```typescript
// ❌ Old pattern - local function
const runAxe = async (container: Element) => {
  return await run(container, {
    rules: { 'color-contrast': { enabled: false } }
  })
}

it('should be accessible', async () => {
  const { container } = render(<Component />)
  const results = await runAxe(container)
  expect(results.violations).toHaveLength(0)
})
```

### After (global utilities)

```typescript
// ✅ New pattern - global function
it('should be accessible', async () => {
  const { container } = render(<Component />)
  await expectNoAxeViolations(container)
})
```

### Before (jest-axe with manual config)

```typescript
// ❌ Old pattern - manual jest-axe setup
await expect(
  axe(container, {
    rules: { 'color-contrast': { enabled: false } },
  }),
).resolves.toHaveNoViolations()
```

### After (global utilities)

```typescript
// ✅ New pattern - simpler and consistent
await expectNoAxeViolations(container)
```

## Benefits

✅ **No imports required** - Functions are globally available  
✅ **Consistent configuration** - Sensible defaults with easy customization  
✅ **Multiple usage patterns** - Assertion, analysis, and logging modes  
✅ **Better error messages** - Clear violation summaries with help URLs  
✅ **Type safety** - Full TypeScript support with IntelliSense  
✅ **Reduced boilerplate** - No more repetitive axe configuration

## Implementation Details

The utilities are implemented in `src/test/accessibility.ts` and made globally available via `src/test/setup.ts`. Type declarations are in `src/test/globals.d.ts`.

This setup mirrors how vitest provides global functions like `describe`, `it`, and `expect` without requiring imports.
