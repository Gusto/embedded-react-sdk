# Embedded React SDK - Architecture Audit

**Date:** February 12, 2026  
**Version:** 0.28.0

## Executive Summary

This document provides a comprehensive analysis of the architectural features, patterns, and technologies used in the Gusto Embedded React SDK. It serves as a reference for evaluating which features are useful, which need revamping, and potential areas for improvement.

---

## Table of Contents

1. [Core Architecture Patterns](#1-core-architecture-patterns)
2. [Provider System](#2-provider-system)
3. [Theming System](#3-theming-system)
4. [Component Adapter Pattern](#4-component-adapter-pattern)
5. [Internationalization (i18n)](#5-internationalization-i18n)
6. [State Management](#6-state-management)
7. [Data Fetching & API Integration](#7-data-fetching--api-integration)
8. [Form Management](#8-form-management)
9. [Error Handling & Boundaries](#9-error-handling--boundaries)
10. [Build System & Tooling](#10-build-system--tooling)
11. [Testing Infrastructure](#11-testing-infrastructure)
12. [Type Safety & Code Quality](#12-type-safety--code-quality)
13. [Styling Architecture](#13-styling-architecture)
14. [Accessibility (A11y)](#14-accessibility-a11y)
15. [Code Generation & Automation](#15-code-generation--automation)
16. [Performance Optimizations](#16-performance-optimizations)
17. [Developer Experience Features](#17-developer-experience-features)

---

## 1. Core Architecture Patterns

### 1.1 Base Component Pattern

**Location:** `src/components/Base/`

**Description:**  
A foundational wrapper component that provides error boundaries, suspense handling, and event management for all SDK components.

**Key Features:**

- Error boundary integration with React Error Boundary
- Suspense integration for async data loading
- Centralized error state management
- Event bubbling system
- Loading indicator management
- Field-level error handling

**Implementation:**

```typescript
interface BaseComponentInterface {
  FallbackComponent?: Component
  LoaderComponent?: Component
  onEvent: OnEventType
}
```

**Assessment:**

- ✅ **Useful:** Provides consistent error/loading handling across all components
- ⚠️ **Needs Review:** Could be simplified; some responsibilities might be split
- 💡 **Recommendation:** Consider breaking into smaller, more focused wrappers

### 1.2 Compound Context Pattern

**Location:** `src/components/Base/createCompoundContext.tsx`

**Description:**  
Custom context creation utility that enforces context usage within provider boundaries.

**Assessment:**

- ✅ **Useful:** Prevents common React context usage errors
- ✅ **Keep:** Standard React pattern, well-implemented

### 1.3 Flow Component Pattern

**Location:** `src/components/Flow/`

**Description:**  
Wrapper for state machine-driven workflows with progress tracking and breadcrumb navigation.

**Key Features:**

- State machine integration (robot3)
- Progress bar/breadcrumbs display
- Event handling delegation
- Context provision for nested components

**Assessment:**

- ✅ **Very Useful:** Core pattern for multi-step workflows
- ⚠️ **Needs Enhancement:** Could benefit from better TypeScript inference
- ⚠️ **Needs Enhancement:** Breadcrumbs pattern for navigation might not be ideal from partner UX standpoint - design is considering deprecation
- ⚠️ **Needs Enhancement:** Tracking current state of breadcrumbs/progress for nested flows
- 💡 **Recommendation:** Add flow composition utilities

---

## 2. Provider System

### 2.1 GustoProvider (Main Provider)

**Location:** `src/contexts/GustoProvider/`

**Description:**  
The primary provider that orchestrates all SDK functionality. Acts as a composition of multiple specialized providers.

**Provider Hierarchy (Top → Bottom):**

```
GustoProvider
├── ComponentsProvider (UI adapter system)
├── LoadingIndicatorProvider (Global loader)
├── ErrorBoundary (Error handling)
├── ThemeProvider (Theming/CSS variables)
├── LocaleProvider (Locale/currency)
├── I18nextProvider (Translations)
└── ApiProvider (API client & React Query)
```

**Props Interface:**

```typescript
interface GustoApiProps {
  config: APIConfig // API base URL, headers, hooks
  dictionary?: ResourceDictionary // Custom translations
  lng?: string // Language (default: 'en')
  locale?: string // Locale (default: 'en-US')
  currency?: string // Currency (default: 'USD')
  theme?: GustoSDKTheme // Theme overrides
  components?: Partial<ComponentsContextType> // UI components
  queryClient?: QueryClient // Optional React Query client
  LoaderComponent?: Component // Global loading component
}
```

**Assessment:**

- ✅ **Excellent:** Well-organized provider composition
- ✅ **Useful:** Clear separation of concerns
- ⚠️ **Consider:** Provider hierarchy could impact re-render performance
- 💡 **Recommendation:** Monitor for unnecessary re-renders; consider memoization strategies

### 2.2 GustoProviderCustomUIAdapter

**Location:** `src/contexts/GustoProvider/GustoProviderCustomUIAdapter.tsx`

**Description:**  
Lower-level provider that does not ship with React SDK default components. Used by partners when they want to completely override all component instances (ex. for use with tree shaking).

**Assessment:**

- ✅ **Useful:** Provides flexibility for non-react-aria UI systems
- ✅ **Keep:** Important for partners with existing design systems and bundle size considerations
- 📝 **Note:** Naming could be clearer (e.g., `GustoProviderCore`)

### 2.3 Individual Providers

#### ThemeProvider

- Manages CSS custom properties
- Parses theme object to CSS variables
- Wraps content in `.GSDK` class container
- **Status:** ✅ Core feature

#### LocaleProvider

- Manages locale and currency context
- Sets `lang` attribute on wrapper div
- **Status:** ✅ Simple and effective

#### ComponentsProvider

- Provides UI component adapters
- Intentionally immutable context
- **Status:** ✅ Essential for component adapter system

#### ApiProvider

- Configures Gusto Embedded API client
- Sets up React Query client
- Registers SDK hooks (request interceptors)
- **Status:** ✅ Critical infrastructure

#### LoadingIndicatorProvider

- Provides global loading component
- Can be overridden per-component
- **Status:** ✅ Useful for consistency

---

## 3. Theming System

### 3.1 Theme Architecture

**Location:** `src/contexts/ThemeProvider/`

**Description:**  
CSS custom properties-based theming system that allows runtime theme customization.

**Key Features:**

- CSS variable-based styling (`--g-*` prefix)
- Runtime theme switching
- Deep merge of partner themes with defaults
- Type-safe theme object
- Automatic rem conversion

**Theme Structure:**

```typescript
interface GustoSDKTheme {
  // Colors
  colorBody: string
  colorPrimary: string
  colorSecondary: string
  colorError: string
  colorWarning: string
  colorSuccess: string
  colorInfo: string
  // Typography
  fontFamily: string
  fontSize*: string
  fontWeight*: string
  // Layout
  *Radius: string
  // Shadows
  shadow*: string
  // Focus
  focusRingColor: string
}
```

**Implementation Details:**

- Themes are injected as `<style>` tags in document head
- Recursive flattening converts nested objects to CSS vars
- Uses `toRem()` helper for consistent sizing
- Root font size detection for accurate rem calculations

**Assessment:**

- ✅ **Excellent:** Modern, flexible approach to theming
- ✅ **Performant:** CSS variables are efficient
- ✅ **DX:** Type-safe with IntelliSense support
- ⚠️ **Minor Issue:** `<style>` injection could be optimized

**Current Implementation Issues:**

- Creates and removes `<style>` tag on every theme change (even if unchanged)
- `useEffect` dependency on `partnerThemeOverrides` object reference
- Potential FOUC (Flash of Unstyled Content) during style replacement
- Not optimal for SSR scenarios

**Optimization Options:**

1. **Update existing style tag content**
   - Reuse the same `<style>` element, only update `textContent`
   - Prevents unnecessary DOM mutations and FOUC

2. **Deep comparison of theme changes**
   - Only update when theme values actually change
   - Add memoization with deep equality check instead of reference check

3. **Memoize CSS string generation**
   - Use `useMemo` for `parseThemeToCSS` output
   - Avoid re-parsing on every render

4. **Constructable Stylesheets API**
   - Use modern `CSSStyleSheet` constructor
   - Better performance, enables stylesheet sharing

5. **CSS-in-JS library integration**
   - Libraries like `emotion` or `styled-components` handle injection more efficiently
   - Better SSR support and hydration

### 3.2 Rem Conversion System

**Location:** `src/helpers/rem.ts`

**Description:**  
Utility functions for converting between pixels and rem units, with dynamic root font size detection.

**Current Implementation:**

```typescript
export function getRootFontSize() {
  const defaultFontSize = '16'
  
  if (typeof window === 'undefined') {
    return defaultFontSize
  }
  
  const match = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('font-size')
    .match(/\d+/)
  return typeof match === 'string' ? match : defaultFontSize
}

export function toRem(pxValue: number) {
  return String(pxValue / Number(getRootFontSize())) + 'rem'
}
```

**Current Implementation Issues:**

1. **Performance:** `getComputedStyle()` is called on every conversion, triggering style recalculation (expensive if done frequently)
2. **Unpredictable behavior:** Root font size can change at runtime:
   - User zooms browser
   - Browser extensions inject CSS
   - JavaScript dynamically changes root font size
   - Media queries change base font size
3. **Inconsistency:** If root font size changes between renders, previously calculated rem values become incorrect relative to new calculations

**Assessment:**

- ✅ **Useful:** Ensures consistent sizing across environments
- ⚠️ **Performance:** Repeated `getComputedStyle()` calls on every conversion
- ⚠️ **Edge Case:** Browser extension injection could affect calculations
- ⚠️ **Unpredictable:** Runtime changes cause inconsistency

**Optimization Options:**

1. **Simple caching with refresh option**
   ```typescript
   let cachedRootFontSize: string | null = null
   
   export function getRootFontSize(options?: { forceRefresh?: boolean }) {
     if (cachedRootFontSize && !options?.forceRefresh) {
       return cachedRootFontSize
     }
     // ... calculation logic ...
     cachedRootFontSize = result
     return cachedRootFontSize
   }
   ```
   - Calculate once, cache result
   - Optionally allow forced recalculation

2. **Provider-level configuration**
   ```typescript
   interface GustoApiProps {
     rootFontSize?: number // Lock to specific value (e.g., 16)
   }
   ```
   - Allow partners to specify base font size
   - Completely predictable behavior

3. **Context-based locking**
   ```typescript
   // Calculate once in ThemeProvider, provide via context
   const rootFontSize = useMemo(() => getRootFontSize(), [])
   ```
   - Calculate on SDK initialization
   - Share via context for consistency

**Benefits of Locking:**
- Better performance (one calculation vs. many)
- Predictable behavior (consistent throughout SDK lifecycle)
- Protection from external CSS interference
- Optional partner control over base font size

---

## 4. Component Adapter Pattern

### 4.1 Architecture

**Location:** `src/contexts/ComponentAdapter/`

**Description:**  
"Bring Your Own UI" system that allows partners to substitute SDK UI components with their own design system components.

**Key Features:**

- Type-safe component contracts via TypeScript interfaces
- Default implementations using react-aria-components
- Automatic default prop application
- Support for partial adapter overrides
- Component-level default props registry

**Component Adapter Flow:**

```
Partner provides custom Button component
           ↓
createComponentsWithDefaults wraps with defaults
           ↓
ComponentsProvider exposes via context
           ↓
Components access via useComponentContext hook
           ↓
Custom Button renders with SDK defaults applied
```

### 4.2 Default Props System

**Location:** `src/contexts/ComponentAdapter/createComponentsWithDefaults.ts`

**Description:**  
Centralized system for managing component default props. Uses a registry pattern to apply defaults automatically.

**Key Components:**

- `componentCreators` - Registry of component wrappers
- `composeWithDefaults()` - HOC that applies defaults
- `applyMissingDefaults()` - Merge utility for props
- `*Defaults` objects - Per-component default values

**Example:**

```typescript
export const ButtonDefaults: Partial<ButtonProps> = {
  variant: 'primary',
  size: 'medium',
}

const wrappedButton = composeWithDefaults<ButtonProps>(ButtonDefaults, 'Button')(CustomButton)
```

**Assessment:**

- ✅ **Excellent:** Solves complex default props problem elegantly
- ✅ **Type-Safe:** Full TypeScript support
- ✅ **Flexible:** Allows granular control
- ⚠️ **Complexity:** Learning curve for partners
- 💡 **Recommendation:** Excellent documentation needed (appears to exist)

### 4.3 Component Type Definitions

**Location:** `src/contexts/ComponentAdapter/componentAdapterTypes.ts`

**Description:**  
Centralized type exports for all adaptable components.

**Supported Components (35 total):**

- Form inputs (TextInput, TextArea, NumberInput, DatePicker, FileInput)
- Selection (Checkbox, CheckboxGroup, Radio, RadioGroup, Select, ComboBox, Switch)
- Layout (Card, Dialog, Modal, Table)
- Feedback (Alert, Badge, Banner, LoadingSpinner, PayrollLoading)
- Navigation (Breadcrumbs, Link, Tabs, Menu)
- Data Display (Table, OrderedList, UnorderedList, DescriptionList, CalendarPreview)
- Typography (Heading, Text)
- Progress (ProgressBar)
- Actions (Button, ButtonIcon)
- Controls (PaginationControl)

**Assessment:**

- ✅ **Comprehensive:** Covers all common UI patterns
- ✅ **Well-Typed:** Clear prop interfaces
- ✅ **Granular Flexibility:** 35 individual components provide SDK consumers with fine-grained control
- ⚠️ **Maintenance:** Large surface area to maintain, but intentional for flexibility

### 4.4 ESLint Rule for Default Props

**Location:** `eslint-rules/no-ui-component-defaults.js`

**Description:**  
Custom ESLint rule (currently defined but not enabled in the primary ESLint flat config) that is intended to prevent developers from setting default props directly in UI component implementations.

**Enforcement:**

- As of this audit, the rule is not wired into `eslint.config.mjs` (the `eslint-rules/` directory is ignored); enabling it is planned future work.
- Intended to be scoped to `/components/Common/UI/` directory
- Detects default values in function parameters
- Enforces use of centralized default registry

**Assessment:**

- ✅ **Excellent:** Intended to ensure architectural consistency once enabled
- ✅ **DX:** Clear error messages guide developers
- 💡 **Recommendation:** Could be published as standalone package

---

## 5. Internationalization (i18n)

### 5.1 i18n Architecture

**Location:** `src/i18n/`

**Library:** i18next + react-i18next

**Key Features:**

- Dynamic translation loading with Suspense
- Namespace-based organization (per component)
- LRU cache for loaded translations
- Partner dictionary override support
- Hot reload during development

**Translation Structure:**

```
i18n/
├── en/
│   ├── common.json (base translations)
│   ├── CompanyOnboarding.json
│   ├── EmployeeList.json
│   └── ... (59 namespaces)
├── I18n.ts (loading utilities)
└── index.ts
```

### 5.2 Dynamic Loading Pattern

**Location:** `src/i18n/I18n.ts`

**Description:**  
Suspense-compatible translation loading system with caching.

**Implementation:**

```typescript
const loadResource = ({ lng, ns }) => {
  // Dynamic import
  const promise = import(`@/i18n/${lng}/${ns}.json`)
  // Suspense integration
  return () => {
    if (isLoading) throw promise
    if (isError) throw new Error(...)
    return resource
  }
}
```

**Hooks:**

- `useI18n(namespaces)` - Load component translations
- `useComponentDictionary(ns, resource)` - Override translations

**Assessment:**

- ✅ **Excellent:** Modern async loading pattern
- ✅ **Performant:** Only loads needed translations
- ✅ **DX:** Automatic Suspense integration
- ⚠️ **Edge Case:** Build time import analysis could fail
- 💡 **Recommendation:** Implement language toggle capability for future support of other language bundles
- 💡 **Recommendation:** Integrate translation for additional languages based on English source into release process
- 💡 **Recommendation:** Consider pre-bundling translations per locale

### 5.3 LRU Cache Implementation

**Location:** `src/helpers/LRUCache.ts`

**Description:**  
Simple Least Recently Used cache for translation resources (capacity: 50).

**Assessment:**

- ✅ **Useful:** Prevents redundant loads
- ⚠️ **Simple:** Basic implementation, no eviction policy tuning
- 💡 **Recommendation:** Remove in favor of using built-in i18next internal mechanisms of checking which resources have been loaded

### 5.4 Translation Watcher (Dev Mode)

**Location:** `build/translationWatcher.js`

**Description:**  
Development tool that watches translation files and triggers hot reload.

**Assessment:**

- ✅ **Great DX:** Instant feedback during development
- ✅ **Keep:** Essential for developer productivity

---

## 6. State Management

### 6.1 State Machine Architecture (robot3)

**Location:** Various component state machines

**Library:** robot3 + react-robot

**Description:**  
Finite state machines for complex multi-step workflows. Used extensively for flows like onboarding, payroll, etc.

**State Machines (12 total):**

- Company Onboarding
- Employee Onboarding
- Employee Self Onboarding
- Contractor Onboarding
- Contractor Payments
- Payroll Flow
- Payroll Landing
- Bank Account Management
- Document Signing (Company & Employee)
- Location Management
- Deduction Management

**Example Structure:**

```typescript
export const bankAccountStateMachine = {
  viewBankAccount: state(
    transition('COMPANY_BANK_ACCOUNT_CHANGE', 'addBankAccount'),
    transition('COMPANY_BANK_ACCOUNT_VERIFY', 'verifyBankAccount'),
    transition('COMPANY_BANK_ACCOUNT_DONE', 'done')
  ),
  addBankAccount: state(...),
  verifyBankAccount: state(...),
  done: final()
}
```

**Integration with Flow Component:**

- State machines define component to render per state
- Flow component handles rendering and event delegation
- Context carries state between steps

**Assessment:**

- ✅ **Excellent:** Clear, predictable state transitions
- ✅ **Testable:** State machines are easy to test
- ✅ **Maintainable:** Visual representation of flow
- ✅ **Bundle size:** robot3 was chosen in favor of XState because of it's superior size
- ✅ **Keep:** No changes needed

### 6.2 React Query Integration

**Via:** `@gusto/embedded-api` + `@tanstack/react-query`

**Configuration:**

- Retry: disabled by default
- Auto-invalidation on mutations
- Query key: `['@gusto/embedded-api']`

**Assessment:**

- ✅ **Standard:** Industry-standard data fetching
- ✅ **Performant:** Built-in caching and deduplication
- ✅ **Keep:** No changes needed

---

## 7. Data Fetching & API Integration

### 7.1 API Client Architecture

**Primary Client:** `@gusto/embedded-api` (Speakeasy-generated SDK)

**Location:** `src/contexts/ApiProvider/`

**Description:**  
React Query-wrapped API client with extensible hook system for request/response interception.

**SDK Hooks System:**

```typescript
interface SDKHooks {
  beforeCreateRequest?: BeforeCreateRequestHook[] // Before Request object creation
  beforeRequest?: BeforeRequestHook[] // After Request, before send
  afterSuccess?: AfterSuccessHook[] // After 2xx response
  afterError?: AfterErrorHook[] // After 4xx/5xx or network error
}
```

**Use Cases:**

- Authentication header injection
- Request/response logging
- Error transformation
- Rate limiting
- Custom retry logic

**Implementation:**

```typescript
const hooks: SDKHooks = {
  beforeRequest: [
    {
      beforeRequest: (context, request) => {
        request.headers.set('Authorization', `Bearer ${token}`)
        return request
      },
    },
  ],
}
```

**Assessment:**

- ✅ **Excellent:** Flexible and powerful
- ✅ **Type-Safe:** Full TypeScript support
- ✅ **Standard Pattern:** Follows fetch interceptor patterns
- 💡 **Recommendation:** Document common use cases with examples

### 7.2 UNSTABLE_Hooks Export

**Location:** `src/UNSTABLE_Hooks.ts`

**Description:**  
Separate entry point for experimental APIs (PayrollConfiguration).

**Assessment:**

- ✅ **Good Practice:** Clear API stability signaling
- 💡 **Recommendation:** Establish graduation criteria for unstable APIs

---

## 8. Form Management

### 8.1 Form Library

**Library:** react-hook-form + @hookform/resolvers (Zod integration)

**Key Features:**

- Zod schema validation
- Error message extraction with @hookform/error-message
- Internationalized error messages
- Field-level and form-level validation

### 8.2 Field Components

**Location:** `src/components/Common/Fields/`

**Description:**  
React Hook Form-integrated field components with built-in validation and error display.

**Key Components:**

- FormTextField
- FormNumberField
- FormSelectField
- FormCheckboxField
- FormRadioGroupField
- FormDatePickerField
- And more...

**Architecture:**

- Each field integrates with `useFormContext()`
- Automatic error message display
- Accessibility attributes
- Component adapter integration for UI rendering

### 8.3 Validation Helpers

**Location:** `src/helpers/validations.ts`

**Description:**  
Reusable Zod schemas for common validation patterns.

**Validations:**

- Name validation (supports international characters)
- Phone number (10 digits)
- ZIP code (5 or 9 digits)
- SSN (with proper format checks)
- Routing number (9 digits)
- Account number (1-17 digits)

**Assessment:**

- ✅ **Excellent:** Type-safe with runtime validation
- ✅ **Reusable:** DRY principle applied
- ⚠️ **Consider:** Some validators could be more flexible (e.g., international phone)

### 8.4 Form Error Handling

**Location:** `src/helpers/apiErrorToList.tsx`

**Description:**  
Transforms API field errors into displayable list items.

**Assessment:**

- ✅ **Useful:** Consistent error display
- 💡 **Recommendation:** Could be more customizable

---

## 9. Error Handling & Boundaries

### 9.1 Error Boundary Strategy

**Levels:**

1. **Global:** GustoProvider level (catches unhandled errors)
2. **Component:** Base component level (per-component isolation)
3. **Query:** QueryErrorResetBoundary (React Query errors)

**Error Types:**

- `APIError` - Server/API errors
- `SDKValidationError` - Client-side validation errors
- Runtime errors - Unexpected crashes

**Fallback Components:**

- `InternalError` - Default error display
- Customizable via `FallbackComponent` prop

### 9.2 Error Context in Base Component

**Features:**

- Error state management
- Field-level error tracking
- Error display with Alert component
- Reset capabilities

**Assessment:**

- ✅ **Robust:** Multi-level error handling
- ✅ **User-Friendly:** Clear error messages
- 💡 **Recommendation:** Add error reporting hook for telemetry

---

## 10. Build System & Tooling

### 10.1 Build Configuration (Vite)

**Location:** `vite.config.ts`

**Build Mode:** Library mode with preserved module structure

**Key Plugins:**

- `@vitejs/plugin-react-swc` - Fast React transforms
- `vite-plugin-dts` - TypeScript declaration generation
- `vite-plugin-externalize-deps` - Peer dependency externalization
- `vite-plugin-stylelint` - SCSS linting
- `vite-plugin-svgr` - SVG to React component
- `vite-plugin-circular-dependency` - Detect circular deps
- `vite-plugin-checker` - TypeScript checking

**Output Structure:**

```
dist/
├── index.js (main entry)
├── index.d.ts (type definitions)
├── UNSTABLE_Hooks.js (experimental APIs)
├── UNSTABLE_Hooks.d.ts
├── style.css (all styles)
└── [preserved module structure]
```

**CSS Preprocessing:**

- SCSS with modern compiler
- Global helpers (`@/styles/Helpers`) injected into all files
- Responsive mixins available globally

**Assessment:**

- ✅ **Modern:** Vite is fast and well-supported
- ✅ **Modular:** Preserved structure allows tree-shaking
- ✅ **Complete:** Comprehensive plugin suite
- ⚠️ **Performance:** Many plugins could slow builds
- 💡 **Recommendation:** Profile build times, consider optimizing

### 10.2 Development Mode

**Features:**

- Watch mode with debouncing (500ms)
- Translation hot reload
- Parallel watch tasks (vite + translations)
- Interactive setup prompt
- Link support for local development

**Assessment:**

- ✅ **Excellent DX:** Fast feedback loop
- ✅ **Stable:** Debouncing prevents thrashing

### 10.3 TypeScript Configuration

**TypeScript & Build Configuration:**

- TS `target`: `ESNext` (per `tsconfig.json`)
- Strict mode enabled
- Path aliases (`@/*` → `src/*`)
- `noEmit: true`; type declarations generated via `vite-plugin-dts` as part of the Vite build
- Vite build `target`: `ES2022`

**Assessment:**

- ✅ **Modern:** Latest TS features
- ✅ **Strict:** Catches many bugs at compile time

---

## 11. Testing Infrastructure

### 11.1 Test Runner (Vitest)

**Configuration:**

- Environment: jsdom
- Coverage: V8 provider
- Global test utilities
- Setup file: `src/test/setup.ts`

**Key Features:**

- Compatible with Jest API
- Fast execution
- Built-in coverage

### 11.2 Testing Libraries

**Dependencies:**

- `@testing-library/react` - Component testing
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - DOM matchers
- `jest-axe` - Accessibility testing
- `axe-core` - A11y rules engine
- `msw` - API mocking
- `jsdom-testing-mocks` - DOM API mocks

### 11.3 Test Utilities

**Location:** `src/test/`

**Key Utilities:**

- `GustoTestApiProvider.tsx` - Test provider wrapper
- `accessibility.ts` - A11y testing helpers
- `mocks/` - MSW request handlers
- `fixtures/` - Test data
- `mockVirtualizers.tsx` - Virtualization mocks

**Global Test Helpers:**

```typescript
// Automatically available in all tests
globalThis.runAxe
globalThis.expectNoAxeViolations
globalThis.runAxeAndLog
globalThis.runAxeOnRender
```

### 11.4 MSW Mock Server

**Location:** `src/test/mocks/`

**Mocked APIs (18 endpoints):**

- Companies
- Employees
- Contractors
- Payrolls
- Pay schedules
- Bank accounts
- Tax forms
- Locations
- And more...

**Assessment:**

- ✅ **Comprehensive:** Most API surfaces covered
- ✅ **Realistic:** Uses actual API response shapes
- 💡 **Recommendation:** Consider generating mocks from OpenAPI spec

### 11.5 Accessibility Testing

**Built-in A11y Testing:**

- Global axe helpers
- Automatic violation detection
- Render-triggered testing
- Violation logging

**Assessment:**

- ✅ **Excellent:** A11y is first-class concern
- ✅ **Automated:** Catches issues early
- 💡 **Recommendation:** Add A11y to CI requirements

---

## 12. Type Safety & Code Quality

### 12.1 TypeScript Usage

**Strict Mode:** ✅ Enabled

**Notable Type Patterns:**

- Discriminated unions for component variants
- Generic constraints for form fields
- Mapped types for theme properties
- Template literal types for event names

**Assessment:**

- ✅ **Excellent:** Heavy TypeScript usage
- ⚠️ **Some `any`:** Identified in adapter system (intentional for flexibility)
- ⚠️ **Enhanced events types:** Some of our component events and props could use stricter definition

### 12.2 ESLint Configuration

**Location:** `eslint.config.mjs` (Flat config format)

**Key Rules:**

- `typescript-eslint` strict type-checked rules
- React hooks rules (exhaustive deps, etc.)
- Import ordering enforcement
- No console statements
- JSX A11y rules
- Custom rules (no-ui-component-defaults)

**Restricted Imports:**

- `react-aria` - Only in UI directory
- `react-aria-components` - Only in UI directory
- Direct UI component imports - Must use context

**Assessment:**

- ✅ **Strict:** Catches many potential issues
- ✅ **Enforces Architecture:** Import restrictions maintain boundaries
- ⚠️ **Many Disabled Rules:** TODO comments suggest technical debt
- 💡 **Recommendation:** Create tickets to re-enable disabled rules

### 12.3 Code Formatting

**Tool:** Prettier

**Pre-commit:** Lint-staged + Husky

**Assessment:**

- ✅ **Standard:** Industry-standard formatting
- ✅ **Automated:** No manual formatting needed

### 12.4 Commit Conventions

**Tool:** commitlint with conventional commits

**Configuration:** `commitlint.config.ts`

**Assessment:**

- ✅ **Professional:** Enables automated changelog generation
- ✅ **Keep:** Good practice

---

## 13. Styling Architecture

### 13.1 CSS Modules

**All component styles:** `*.module.scss`

**Features:**

- Scoped styles (prevents global pollution)
- TypeScript declarations generated
- Composable styles

### 13.2 Global SCSS Architecture

**Location:** `src/styles/`

**Files:**

- `sdk.scss` - Main stylesheet, imported by ThemeProvider
- `_Helpers.scss` - Utility functions (toRem, etc.)
- `_Responsive.scss` - Breakpoint mixins
- `_Base.scss` - Reset/normalize styles
- `_Dialog.scss` - Dialog specific styles (react-aria)
- `_Popover.scss` - Popover styles (react-aria)

**Global Injection:**
Via Vite config, all SCSS files automatically get:

```scss
@use '@/styles/Helpers' as *;
@use '@/styles/Responsive' as *;
```

**Assessment:**

- ✅ **DX:** No need to manually import helpers
- ⚠️ **Workspace Rule:** Don't manually import helpers (documented in rules)
- 💡 **Recommendation:** ESLint rule to prevent manual imports

### 13.3 Responsive Design

**Location:** `src/styles/_Responsive.scss`

**Breakpoints:**

- Mobile-first approach
- Container query support (via `useContainerBreakpoints`)

**Helpers:**

- `src/helpers/responsive.ts` - Breakpoint utilities

**Assessment:**

- ✅ **Modern:** Container queries are cutting-edge
- ✅ **Flexible:** Both CSS and JS breakpoints available

### 13.4 CSS Custom Properties

**Prefix:** `--g-*`

**Scope:** `.GSDK` class

**Generation:**

- Dynamic from theme object
- Recursive flattening (nested objects → nested variables)
- Example: `theme.button.primary.background` → `--g-button-primary-background`

**Assessment:**

- ✅ **Flexible:** Runtime theme switching
- ✅ **Scoped:** Won't conflict with host app
- ✅ **Standard:** Native CSS feature

---

## 14. Accessibility (A11y)

### 14.1 Foundation: React Aria

**Library:** Adobe's React Aria + React Aria Components

**Coverage:**

- All form inputs
- Dialogs/modals
- Menus
- Date pickers
- Number formatters
- Localization

**Benefits:**

- WCAG 2.1 compliant out of the box
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes

**Assessment:**

- ✅ **Excellent:** Industry-leading A11y library
- ✅ **Proven:** Battle-tested by Adobe
- ⚠️ **Brittle Dependency:** Challenging to maintain and upgrade; considering future decoupling
- 💡 **Recommendation:** Plan migration strategy to decouple from react-aria long-term

### 14.2 A11y Testing Infrastructure

**Automated Testing:**

- jest-axe integration
- Global test helpers
- CI-ready

**Manual Testing:**

- Storybook A11y addon
- Component-level stories

**Assessment:**

- ✅ **Comprehensive:** Both automated and manual testing
- ✅ **Best Practice:** A11y checks in every test

### 14.3 Semantic HTML

**Observed Patterns:**

- Proper heading hierarchy
- Semantic landmarks (`<article>`, `<nav>`)
- Form labels
- Button vs link distinction

**Assessment:**

- ✅ **Good:** Semantic HTML usage throughout

---

## 15. Code Generation & Automation

### 15.1 Theme Documentation Generator

**Location:** `build/generateThemeDocs.ts`

**Description:**  
Generates markdown documentation of all theme variables using TypeScript AST parsing (ts-morph).

**Output:** `docs/theming/theme-variables.md`

**Assessment:**

- ✅ **Excellent:** Docs always in sync with code
- 💡 **Recommendation:** Similar approach for other APIs

### 15.2 Component Adapter Documentation Generator

**Location:** `build/generateAdapterPropDocs.ts`

**Description:**  
Generates documentation for component adapter prop types.

**Assessment:**

- ✅ **Useful:** Reduces documentation drift

### 15.3 Event Type Documentation Generator

**Location:** `build/eventTypeDocsEmitter.ts`

**Description:**  
Generates documentation for SDK events.

**Assessment:**

- ✅ **Consistent:** Event docs always accurate

### 15.4 Translation Interface Generator

**Location:** `build/interface.js`

**Description:**  
Generates TypeScript types from translation JSON files.

**Benefits:**

- Type-safe translation keys
- IntelliSense for `t()` function
- Compile-time checks for missing translations

**Assessment:**

- ✅ **Excellent:** Prevents translation key typos
- ✅ **DX:** IntelliSense for translations is fantastic

---

## 16. Performance Optimizations

### 16.1 Code Splitting

**Strategies:**

- Dynamic translation loading (per namespace)
- Lazy component loading (via Suspense)
- Tree-shakeable exports (preserved modules)

### 16.2 Memoization

**Observed Usage:**

- `useMemo` for expensive computations
- Provider value memoization
- Component context immutability

**Assessment:**

- ✅ **Good:** Used where appropriate
- ⚠️ **Review:** Some providers might benefit from more memoization

### 16.3 Virtualization

**Mocked in Tests:** `mockVirtualizers.tsx`

**Assessment:**

- ⚠️ **Unclear:** Not obvious where virtualization is used
- 💡 **Recommendation:** Document virtualization strategy

### 16.4 Bundle Size Considerations

**Optimizations:**

- Peer dependencies externalized
- CSS bundled separately
- SVGs as components (tree-shakeable)
- Modern target (ES2022 - no unnecessary polyfills)

**Assessment:**

- ✅ **Good:** Multiple size optimizations in place
- 💡 **Recommendation:** Set up bundle size monitoring

---

## 17. Developer Experience Features

### 17.1 Storybook Integration

**Dependencies:**

- `storybook` (v10)
- `@storybook/react-vite`
- `@storybook/addon-a11y`
- `@storybook/addon-docs`
- `@storybook/test-runner`

**Assessment:**

- ✅ **Excellent:** Component development/documentation tool
- ✅ **A11y:** Accessibility addon included

### 17.2 Interactive Setup Prompt

**Location:** `build/prompt.js`

**Description:**  
Interactive CLI for development environment setup.

**Assessment:**

- ✅ **Nice Touch:** Improves onboarding

### 17.3 Development Scripts

**Key Scripts:**

- `npm run dev` - Parallel watch mode (Vite + translations)
- `npm run docs:watch` - Live documentation preview
- `npm run lint` - Auto-fix linting issues
- `npm run format` - Auto-format code

**Assessment:**

- ✅ **Complete:** All necessary dev commands
- ✅ **DX:** Good developer experience

### 17.4 Type Generation & IntelliSense

**Features:**

- Auto-generated translation types
- Component prop documentation
- Theme variable autocomplete
- Event type autocomplete

**Assessment:**

- ✅ **Excellent:** Best-in-class TypeScript DX

---

## Summary of Recommendations

### 🟢 Keep (No Changes)

1. Base component error/suspense handling
2. Provider composition architecture (including GustoProviderCustomUIAdapter for tree-shaking)
3. TypeScript strict mode
4. Component adapter pattern with granular (35 individual) components for maximum flexibility
5. Theme system (CSS custom properties)
6. Vitest + Testing Library stack
7. MSW for API mocking
8. Code generation for docs
9. Accessibility-first approach
10. robot3 state machine library (chosen for superior bundle size)
11. Translation watcher for development DX

### 🟡 Review/Enhance

1. **Base Component Pattern:** Consider breaking into smaller, more focused wrappers → [SDK-494](https://gustohq.atlassian.net/browse/SDK-494)
2. **Flow Component Pattern:** → [SDK-481](https://gustohq.atlassian.net/browse/SDK-481)
   - Add flow composition utilities
   - Improve TypeScript inference
   - Address breadcrumbs/progress tracking for nested flows (design considering deprecation)
3. **Provider Performance:** Audit for unnecessary re-renders; consider memoization strategies → [SDK-482](https://gustohq.atlassian.net/browse/SDK-482)
4. **Theme System:** Optimize `<style>` tag injection (update existing element vs remove/recreate, add deep comparison, memoize CSS generation, or consider Constructable Stylesheets API) → [SDK-477](https://gustohq.atlassian.net/browse/SDK-477)
5. **Rem Conversion:** Add ability to lock root font size (cache value to avoid repeated `getComputedStyle()` calls, prevent runtime inconsistencies, optionally allow partner configuration) → [SDK-478](https://gustohq.atlassian.net/browse/SDK-478)
6. **i18n System:**
   - Implement language toggle capability for future multi-language support → [SDK-479](https://gustohq.atlassian.net/browse/SDK-479)
   - Integrate translation process for additional languages into release pipeline
   - Consider pre-bundling translations per locale
   - Remove LRU cache in favor of built-in i18next internal mechanisms → [SDK-480](https://gustohq.atlassian.net/browse/SDK-480)
7. **Form Error Handling:** Make apiErrorToList more customizable → [SDK-491](https://gustohq.atlassian.net/browse/SDK-491)
8. **Error Reporting:** Add telemetry/error tracking hook → [SDK-492](https://gustohq.atlassian.net/browse/SDK-492)
9. **Build Performance:** Profile build times, consider optimizing plugin usage → [SDK-493](https://gustohq.atlassian.net/browse/SDK-493)
10. **ESLint Disabled Rules:** Re-enable TODO rules (create tech debt tickets) → [SDK-486](https://gustohq.atlassian.net/browse/SDK-486)
11. **Provider Re-renders:** Some providers might benefit from more memoization (see #3)
12. **Virtualization:** Document strategy, ensure large lists are virtualized → [SDK-488](https://gustohq.atlassian.net/browse/SDK-488)
13. **Bundle Size:** Set up monitoring and budgets → [SDK-483](https://gustohq.atlassian.net/browse/SDK-483)
14. **SCSS Imports:** Add ESLint rule to prevent manual helper imports → [SDK-485](https://gustohq.atlassian.net/browse/SDK-485)
15. **A11y Testing:** Add accessibility checks to CI requirements → [SDK-484](https://gustohq.atlassian.net/browse/SDK-484)
16. **MSW Mocks:** Consider generating mocks from OpenAPI spec → [SDK-489](https://gustohq.atlassian.net/browse/SDK-489)
17. **API Documentation:** Document common SDK hooks use cases with examples → [SDK-487](https://gustohq.atlassian.net/browse/SDK-487)
18. **UNSTABLE APIs:** Establish graduation criteria for unstable APIs → [SDK-490](https://gustohq.atlassian.net/browse/SDK-490)

### 🔴 Revamp/Reconsider

1. **React Aria Dependency:** Plan long-term migration strategy to decouple from react-aria (brittle dependency, difficult to maintain/upgrade) → [SDK-475](https://gustohq.atlassian.net/browse/SDK-475)
2. **Validation Helpers:** More flexible validators (e.g., international phone support) → [SDK-476](https://gustohq.atlassian.net/browse/SDK-476)

---

## Architectural Strengths

1. **Modularity:** Clear separation of concerns
2. **Type Safety:** Comprehensive TypeScript usage
3. **Accessibility:** First-class support with React Aria
4. **Flexibility:** Component adapter allows full customization
5. **Developer Experience:** Excellent tooling and automation
6. **Testing:** Comprehensive test infrastructure
7. **Documentation:** Auto-generated, always in sync
8. **Standards:** Modern best practices throughout

---

## Architectural Concerns

1. **Complexity:** Many layers of abstraction
2. **Learning Curve:** Steep for new contributors
3. **Bundle Size:** Unknown, needs monitoring
4. **Provider Re-renders:** Potential performance issues
5. **Technical Debt:** Several ESLint rules disabled
6. **i18n Strategy:** Current implementation could be simplified (LRU cache removal, language toggle support)
7. **Flow Navigation UX:** Breadcrumbs pattern may need reconsideration based on design feedback
8. **React Aria Dependency:** Brittle dependency that is difficult to maintain and upgrade; decoupling needed
9. **Component Maintenance:** 35 adaptable components requires significant maintenance (but intentional for flexibility)

---

## Conclusion

The Embedded React SDK demonstrates a mature, well-architected codebase with strong foundations in TypeScript, accessibility, and developer experience. The architecture makes appropriate use of modern React patterns and provides excellent flexibility through theming and component adaptation.

Key strengths include the accessibility-first approach, comprehensive testing infrastructure, automated documentation generation, and thoughtful library choices (robot3 for bundle size). The component adapter system provides partners with granular flexibility through 35 individual adaptable components for custom UI implementations while maintaining bundle size considerations through GustoProviderCustomUIAdapter.

The main areas for improvement center around:

- **React Aria decoupling**: Long-term migration strategy needed to address brittle dependency issues
- **i18n enhancements**: Language toggle support, translation pipeline integration, and simplifying the caching strategy
- **Flow component evolution**: Addressing breadcrumbs/progress UX concerns and nested flow tracking
- **Performance monitoring**: Bundle size tracking and provider re-render optimization
- **Documentation**: Expanding SDK hooks examples and virtualization strategy
- **Technical debt**: Re-enabling disabled ESLint rules

Overall assessment: **8/10** - Production-ready with well-justified architectural decisions and clear enhancement opportunities.

---

## Related Jira Tickets

The recommendations in this document have been captured as actionable tickets under Epic [SDK-332](https://gustohq.atlassian.net/browse/SDK-332):

### High Priority
- [SDK-475](https://gustohq.atlassian.net/browse/SDK-475) - Decouple from React Aria dependency
- [SDK-483](https://gustohq.atlassian.net/browse/SDK-483) - Set up bundle size monitoring and budgets
- [SDK-484](https://gustohq.atlassian.net/browse/SDK-484) - Add accessibility testing to CI requirements

### Medium Priority
- [SDK-476](https://gustohq.atlassian.net/browse/SDK-476) - Expand validation helpers for international phone support
- [SDK-477](https://gustohq.atlassian.net/browse/SDK-477) - Optimize theme style tag injection
- [SDK-478](https://gustohq.atlassian.net/browse/SDK-478) - Add root font size locking to rem conversion
- [SDK-481](https://gustohq.atlassian.net/browse/SDK-481) - Address Flow breadcrumbs/progress UX for nested flows
- [SDK-482](https://gustohq.atlassian.net/browse/SDK-482) - Audit and optimize provider re-render performance
- [SDK-488](https://gustohq.atlassian.net/browse/SDK-488) - Document virtualization strategy and ensure implementation
- [SDK-492](https://gustohq.atlassian.net/browse/SDK-492) - Add telemetry/error tracking hook for observability

### Low Priority
- [SDK-479](https://gustohq.atlassian.net/browse/SDK-479) - Implement language toggle for multi-language support
- [SDK-480](https://gustohq.atlassian.net/browse/SDK-480) - Remove custom LRU cache in favor of i18next internals
- [SDK-485](https://gustohq.atlassian.net/browse/SDK-485) - Add ESLint rule to prevent manual SCSS helper imports
- [SDK-486](https://gustohq.atlassian.net/browse/SDK-486) - Re-enable disabled ESLint rules and address technical debt
- [SDK-487](https://gustohq.atlassian.net/browse/SDK-487) - Document SDK hooks patterns with common use case examples
- [SDK-489](https://gustohq.atlassian.net/browse/SDK-489) - Generate MSW mocks from OpenAPI spec
- [SDK-493](https://gustohq.atlassian.net/browse/SDK-493) - Profile and optimize build performance

### Lowest Priority
- [SDK-490](https://gustohq.atlassian.net/browse/SDK-490) - Establish graduation criteria for UNSTABLE APIs
- [SDK-491](https://gustohq.atlassian.net/browse/SDK-491) - Make apiErrorToList more customizable
- [SDK-494](https://gustohq.atlassian.net/browse/SDK-494) - Consider breaking Base Component into smaller focused wrappers

---

**Document Version:** 1.0  
**Last Updated:** February 12, 2026  
**Author:** Dmitriy Abragamov
