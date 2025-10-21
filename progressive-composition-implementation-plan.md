# Progressive Composition + Routing + Flow Contract Implementation Plan

## Executive Summary

This plan introduces a unified progressive composition system that enables three integration modes per view (preset, compound, render-prop), router-agnostic navigation, and flow-aware wrappers supporting both SDK-provided and external state machines. The implementation builds on the existing component adapter system, flow infrastructure using robot3, and event-driven architecture while maintaining backward compatibility.

## 1) Design Approach

### Public API Surface

#### Progressive Composition Modes per View

```tsx
// Case 1: Preset - Complete default layout (current behavior)
<Employee.Profile employeeId="123" onEvent={handleEvent} />

// Case 2: Compound - Subcomponent composition (extends current patterns)
<Employee.Profile employeeId="123" onEvent={handleEvent}>
  <Employee.Profile.Header />
  <Employee.Profile.PersonalInfo />
  <Employee.Profile.AddressInfo />
  <Employee.Profile.Actions />
</Employee.Profile>

// Case 3: Render-prop - Full control with slot reuse
<Employee.Profile employeeId="123" onEvent={handleEvent}>
  {(slots, ctx) => (
    <CustomLayout>
      <CustomHeader title="Employee Details" />
      <TwoColumnLayout>
        <LeftColumn>{slots.PersonalInfo}</LeftColumn>
        <RightColumn>
          {slots.AddressInfo}
          {slots.Actions}
        </RightColumn>
      </TwoColumnLayout>
    </CustomLayout>
  )}
</Employee.Profile>

// With component overrides (builds on existing ComponentAdapter pattern)
<Employee.Profile
  employeeId="123"
  onEvent={handleEvent}
  components={{
    Header: CustomProfileHeader,
    PersonalInfo: MyPersonalInfoForm
  }}
/>
```

#### Router-Agnostic Navigation Contract

```ts
// Core navigation types
export type Navigator = {
  push: (to: string, state?: any) => void
  replace: (to: string, state?: any) => void
  back?: () => void
  toStep?: (stepId: string, params?: Record<string, string>) => string
}

export type RouteState = {
  params: Record<string, string>
  query: URLSearchParams
  step?: string
}

// Router adapters
export function createReactRouterNavigator({ useNavigate, makePath }): Navigator

export function createTanStackNavigator({ router, makePath }): Navigator
```

#### Flow-Aware Wrapper

```tsx
// Current Flow pattern (using existing robot3 infrastructure)
<Flow machine={employeeOnboardingMachine} onEvent={handleEvent} />

// Enhanced Flow with navigation support
<Flow
  machine={employeeOnboardingMachine}
  onEvent={handleEvent}
  navigator={navigator}
/>

// New GEP.Flow wrapper supporting external state machines
<GEP.Flow
  machine={employeeOnboardingMachine}
  onEvent={handleEvent}
  navigator={navigator}
>
  {/* Views get FlowContext + NavigationContext automatically */}
</GEP.Flow>

// Or with external FSM (XState, Zustand, etc.)
<GEP.Flow
  externalService={myXStateService}
  onEvent={handleEvent}
  navigator={navigator}
>
  <Employee.Profile />
</GEP.Flow>

// Enhanced FlowContextInterface (extends existing)
export interface FlowContextInterface {
  component: React.ComponentType<CommonComponentInterface> | null
  onEvent: OnEventType<EventType, unknown>
  showProgress?: boolean
  totalSteps?: number
  currentStep?: number | null
  defaultValues?: Record<string, unknown>
  progressBarCta?: React.ComponentType | null
  // New navigation context
  navigator?: Navigator
  route?: RouteState
}
```

### Event-to-Navigation Mapping

Views emit existing typed events from `componentEvents`. The enhanced Flow wrapper translates these to navigation calls:

```tsx
// Existing events (from src/shared/constants.ts)
componentEvents.EMPLOYEE_PROFILE_DONE → navigator.push(navigator.toStep("employee.taxes"))
componentEvents.EMPLOYEE_TAXES_DONE → navigator.push(navigator.toStep("employee.paymentMethod"))
componentEvents.COMPANY_LOCATION_DONE → navigator.push(navigator.toStep("company.federalTaxes"))

// Enhanced Flow handles navigation automatically
<Flow
  machine={employeeOnboardingMachine}
  navigator={navigator}
  onEvent={(eventType, data) => {
    // Custom event handling still works
    console.log('Event:', eventType, data)

    // Navigation happens automatically based on machine transitions
    // OR manually: navigator.push(getNextStep(eventType))
  }}
/>
```

This keeps views router-agnostic while enabling step transitions using the existing event system.

### DX and Maintainability Benefits

- **Adapter Compatibility**: Builds on existing component adapter system
- **Router Independence**: No SDK dependency on specific router
- **Progressive Enhancement**: Start with presets, enhance with compound/render-prop
- **Type Safety**: Full TypeScript support for slots and context

### Backward Compatibility

Default behavior preserves current component rendering. New props are optional. Existing `onEvent` callbacks continue working alongside new navigation system.

## 2) Repository Survey

### Component Views and Subcomponents

```
src/components/Employee/
├── index.ts - Main exports (Profile, Compensation, etc.)
├── Profile/ - Personal info form and display
├── Compensation/ - Salary/wage configuration
├── FederalTaxes/ - Tax withholding forms
├── StateTaxes/ - State-specific tax forms
├── PaymentMethod/ - Direct deposit/check setup
├── Deductions/ - Benefits and deduction management
├── DocumentSigner/ - Form signing workflow
├── OnboardingSummary/ - Final onboarding step
├── Landing/ - Initial onboarding welcome
├── OnboardingFlow/ - Full employee onboarding FSM
└── SelfOnboardingFlow/ - Employee self-service FSM

src/components/Company/
├── index.tsx - Main exports
├── OnboardingOverview/ - Company setup overview
├── Locations/ - Business location management
├── FederalTaxes/ - Company federal tax setup
├── Industry/ - Business classification
├── BankAccount/ - Company banking setup
├── StateTaxes/ - Company state tax configuration
├── DocumentSigner/ - Company document signing
├── PaySchedule/ - Payroll schedule setup
├── AssignSignatory/ - Signatory assignment
└── OnboardingFlow/ - Full company setup FSM

src/components/Contractor/
├── Profile/ - Contractor personal info
├── Address/ - Contractor address forms
├── PaymentMethod/ - Contractor payment setup
└── OnboardingFlow/ - Contractor onboarding FSM

src/components/Payroll/ (UNSTABLE)
├── PayrollLanding/ - Payroll start page
├── PayrollConfiguration/ - Payroll setup
├── PayrollOverview/ - Payroll review
├── PayrollEditEmployee/ - Per-employee edits
└── PayrollFlow/ - Run payroll FSM
```

### Existing State Machines and Flow Infrastructure

```
src/components/Flow/
├── Flow.tsx - Current flow wrapper using robot3
├── useFlow.ts - Flow context hook

State Machine Definitions:
├── src/components/Employee/OnboardingFlow/onboardingStateMachine.ts
├── src/components/Company/OnboardingFlow/onboardingStateMachine.ts
├── src/components/Payroll/PayrollFlow/payrollStateMachine.ts
├── src/components/Company/DocumentSigner/stateMachine.ts
└── src/components/Employee/SelfOnboardingFlow/selfOnboardingMachine.ts
```

### Provider and Configuration Modules

```
src/contexts/
├── GustoProvider/ - Main SDK provider with component adapters
├── ComponentAdapter/ - Component override system
├── ApiProvider/ - HTTP client and hooks
├── ThemeProvider/ - CSS custom properties theming
├── LocaleProvider/ - Internationalization
└── LoadingIndicatorProvider/ - Loading state management
```

### Event System

```
src/shared/constants.ts - All component events organized by namespace
- employeeEvents, companyEvents, contractorEvents, runPayrollEvents
- Combined into componentEvents with TypeScript union types
```

### Ladle Stories and Documentation

```
.ladle/ - Ladle development environment configuration
docs/ - Comprehensive documentation structure
- component-adapter/ - Component customization docs
- integration-guide/ - Implementation guides including routing
- workflows-overview/ - Available workflows documentation
- theming/ - CSS theming documentation
```

### Inconsistencies to Address

- Flow components sometimes have "Flow" suffix, sometimes don't
- State machine patterns vary across workflows
- No standardized slot naming conventions
- Component adapter coverage not universal

## 3) Phased Plan

### Phase 0: Foundation & Planning

#### Epic: Progressive Composition Standards

**Goal**: Establish consistent patterns and naming conventions for progressive composition across all SDK components.

**Story PC-1**: As a developer, I want consistent slot naming so I can predict component APIs

- **Acceptance Criteria**:
  - Document standard slot names (Header, Content, Actions, etc.)
  - Define step ID format (namespace.step)
  - Create naming convention guide
- **Files**: `docs/progressive-composition-standard.md`
- **Definition of Done**: All team members can reference slot naming standards

**Story PC-2**: As a developer, I want a complete inventory of all views and their step IDs

- **Acceptance Criteria**:
  - Catalog all existing views with current structure
  - Assign stable step IDs to all workflow steps
  - Document workflow transitions and dependencies
- **Files**: `src/routing/step-registry.ts`, `docs/step-inventory.md`
- **Definition of Done**: Complete mapping of all views to step IDs

#### Epic: Type System Foundation

**Goal**: Create robust TypeScript interfaces for navigation and composition.

**Story TS-1**: As a developer, I want type-safe navigation interfaces

- **Acceptance Criteria**:
  - Complete Navigator and RouteState TypeScript definitions
  - Add comprehensive JSDoc documentation
  - Ensure compatibility with React Router and TanStack Router
- **Files**: `src/routing/types.ts`
- **Definition of Done**: Full TypeScript support with IntelliSense

**Story TS-2**: As a technical stakeholder, I want an RFC for the progressive composition architecture

- **Acceptance Criteria**:
  - Technical specification with code examples
  - Migration strategy from current patterns
  - Breaking change analysis and timeline
- **Files**: `docs/rfc-progressive-composition.md`
- **Definition of Done**: RFC approved by architecture team

### Phase 1: Navigation Infrastructure

#### Epic: Router-Agnostic Navigation System

**Goal**: Enable navigation that works with any router without SDK lock-in.

**Story NAV-1**: As a developer using React Router, I want SDK navigation to work seamlessly

- **Acceptance Criteria**:
  - Create React Router adapter that integrates with `useNavigate`
  - Support standard navigation methods (push, replace, back)
  - Enable step-based navigation with path generation
- **Files**: `src/routing/react-router.ts`
- **Definition of Done**: React Router integration works in demo app

**Story NAV-2**: As a developer using TanStack Router, I want SDK navigation to work seamlessly

- **Acceptance Criteria**:
  - Create TanStack Router adapter
  - Support type-safe route navigation
  - Enable step-based navigation with route generation
- **Files**: `src/routing/tanstack-router.ts`
- **Definition of Done**: TanStack Router integration tested and documented

**Story NAV-3**: As a developer, I want navigation context available throughout the SDK

- **Acceptance Criteria**:
  - Create NavigationProvider that accepts Navigator
  - Expose navigation via React context
  - Maintain backward compatibility when navigation not provided
- **Files**: `src/contexts/NavigationProvider/NavigationProvider.tsx`, `useNavigation.ts`
- **Definition of Done**: Navigation context available in any SDK component

#### Epic: Development & Testing Infrastructure

**Goal**: Support development and testing of navigation features.

**Story DEV-1**: As a developer writing Ladle stories, I want navigation to work in isolation

- **Acceptance Criteria**:
  - Create mock navigator for testing and stories
  - Add Ladle addon for navigation demonstration
  - Enable story-driven navigation testing
- **Files**: `src/routing/mock-navigator.ts`, `.ladle/navigation-addon.tsx`
- **Definition of Done**: All Ladle stories can demonstrate navigation

#### Epic: Provider System Enhancement

**Goal**: Integrate navigation seamlessly into existing provider system.

**Story PROV-1**: As a developer, I want to configure navigation at the provider level

- **Acceptance Criteria**:
  - Add optional `navigator` prop to GustoProvider
  - Maintain all existing GustoProvider functionality
  - Thread navigation through to NavigationProvider automatically
- **Files**: `src/contexts/GustoProvider/GustoProvider.tsx`
- **Definition of Done**: Single provider configuration supports navigation

```tsx
// Example implementation
export const GustoProvider: React.FC<GustoProviderProps> = ({ navigator, ...existingProps }) => {
  return (
    <GustoProviderCustomUIAdapter {...existingProps}>
      {navigator ? (
        <NavigationProvider navigator={navigator}>{existingProps.children}</NavigationProvider>
      ) : (
        existingProps.children
      )}
    </GustoProviderCustomUIAdapter>
  )
}
```

### Phase 2: Progressive Composition Pilot

#### Epic: Employee.Profile Progressive Composition

**Goal**: Implement all three composition modes in Employee.Profile as a proof of concept.

**Story COMP-1**: As a developer, I want to use Employee.Profile in preset mode for quick setup

- **Acceptance Criteria**:
  - Maintains existing `<Employee.Profile employeeId="123" />` API
  - All existing functionality and tests continue working
  - No breaking changes to current usage
- **Files**: `src/components/Employee/Profile/Profile.tsx`
- **Definition of Done**: Existing Employee.Profile usage unchanged

**Story COMP-2**: As a developer, I want to use Employee.Profile in compound mode for custom layouts

- **Acceptance Criteria**:
  - Support `<Employee.Profile><Employee.Profile.Header /><Employee.Profile.PersonalInfo /></Employee.Profile>`
  - Export subcomponents via Object.assign pattern
  - Each subcomponent receives appropriate context and props
- **Files**: `src/components/Employee/Profile/Profile.tsx`, create subcomponent files
- **Definition of Done**: Compound composition works with full type safety

**Story COMP-3**: As a developer, I want to use Employee.Profile in render-prop mode for full control

- **Acceptance Criteria**:
  - Support children function: `{(slots, ctx) => <CustomLayout />}`
  - Provide all slots as reusable components
  - Pass context including navigation, employee data, and flow state
- **Files**: `src/components/Employee/Profile/Profile.tsx`
- **Definition of Done**: Full render-prop control with slot reuse

**Story COMP-4**: As a developer, I want to override specific slots without render-prop

- **Acceptance Criteria**:
  - Support `components={{ Header: MyHeader }}` prop
  - Partial slot overrides work with all three modes
  - Maintains type safety for slot overrides
- **Files**: `src/components/Employee/Profile/Profile.tsx`
- **Definition of Done**: Slot overrides work across all composition modes

#### Epic: Navigation Integration Pilot

**Goal**: Demonstrate navigation integration with progressive composition.

**Story NAV-COMP-1**: As a developer, I want Employee.Profile to trigger navigation automatically

- **Acceptance Criteria**:
  - EMPLOYEE_PROFILE_DONE event triggers navigation when navigator available
  - Falls back to onEvent when navigator not provided
  - Navigation works in all three composition modes
- **Files**: `src/components/Employee/Profile/Profile.tsx`
- **Definition of Done**: Navigation works seamlessly with existing event system

#### Epic: Development Experience Validation

**Goal**: Ensure great developer experience with comprehensive examples and tests.

**Story DX-1**: As a developer, I want comprehensive examples of all Employee.Profile composition modes

- **Acceptance Criteria**:
  - Ladle stories for preset, compound, and render-prop modes
  - Router adapter demonstration stories
  - Interactive examples showing slot customization
- **Files**: `src/components/Employee/Profile/Profile.stories.tsx`
- **Definition of Done**: All composition modes documented with live examples

**Story DX-2**: As a developer, I want confidence that all composition modes work identically

- **Acceptance Criteria**:
  - Unit tests verify identical behavior across modes
  - Integration tests for navigation and event handling
  - Performance tests ensure no regression
- **Files**: `src/components/Employee/Profile/Profile.test.tsx`
- **Definition of Done**: 100% test coverage for all composition modes

### Phase 3: Full Progressive Composition Rollout

#### Epic: Employee Component Family Progressive Composition

**Goal**: Extend progressive composition to all Employee components.

**Story EMP-ALL-1**: As a developer, I want all Employee components to support progressive composition

- **Acceptance Criteria**:
  - Employee.Compensation supports all 3 composition modes
  - Employee.Taxes supports all 3 composition modes
  - Employee.PaymentMethod supports all 3 composition modes
  - Employee.Deductions supports all 3 composition modes
  - All maintain backward compatibility
- **Files**: All `src/components/Employee/*/` view components
- **Definition of Done**: Complete Employee namespace supports progressive composition

#### Epic: Company Component Family Progressive Composition

**Goal**: Extend progressive composition to all Company components.

**Story COMP-ALL-1**: As a developer, I want all Company components to support progressive composition

- **Acceptance Criteria**:
  - Company.OnboardingOverview supports all 3 composition modes
  - Company.Locations supports all 3 composition modes
  - Company.BankAccount supports all 3 composition modes
  - Company.StateTaxes supports all 3 composition modes
  - All maintain backward compatibility
- **Files**: All `src/components/Company/*/` view components
- **Definition of Done**: Complete Company namespace supports progressive composition

#### Epic: Contractor Component Family Progressive Composition

**Goal**: Extend progressive composition to all Contractor components.

**Story CONT-ALL-1**: As a developer, I want all Contractor components to support progressive composition

- **Acceptance Criteria**:
  - Contractor.Profile supports all 3 composition modes
  - Contractor.Address supports all 3 composition modes
  - Contractor.PaymentMethod supports all 3 composition modes
  - All maintain backward compatibility
- **Files**: All `src/components/Contractor/*/` view components
- **Definition of Done**: Complete Contractor namespace supports progressive composition

#### Epic: Enhanced Flow System

**Goal**: Upgrade Flow component to support navigation and external state machines.

**Story FLOW-1**: As a developer, I want Flow to support navigation automatically

- **Acceptance Criteria**:
  - Flow accepts optional `navigator` prop
  - Automatically handles navigation based on events
  - Maintains full backward compatibility with existing robot3 usage
- **Files**: `src/components/Flow/Flow.tsx`
- **Definition of Done**: Navigation works with all existing state machines

**Story FLOW-2**: As a developer, I want to use external state machines with Flow

- **Acceptance Criteria**:
  - Flow accepts optional `externalService` prop for XState, Zustand, etc.
  - Provides adapter layer for external FSMs
  - Navigation works with external state machines
- **Files**: `src/components/Flow/ExternalServiceAdapter.tsx`
- **Definition of Done**: External FSMs integrate seamlessly with SDK

**Story FLOW-3**: As a developer, I want enhanced navigation events for analytics and debugging

- **Acceptance Criteria**:
  - Add beforeNavigate, stepEntered, stepCompleted, flowCompleted events
  - Events include relevant context and state information
  - Maintain compatibility with existing event system
- **Files**: `src/shared/constants.ts`
- **Definition of Done**: Enhanced events available across all flows

#### Epic: Consistency & Standards Enforcement

**Goal**: Ensure consistent slot naming and behavior across all components.

**Story STD-1**: As a developer, I want consistent slot maps across similar components

- **Acceptance Criteria**:
  - Standardized slot names (Header, Content, Actions, etc.)
  - Complete step registry with stable IDs
  - Documented workflow transitions
- **Files**: Update all view slot definitions, `src/routing/step-registry.ts`
- **Definition of Done**: Consistent developer experience across all components

**Story STD-2**: As a developer, I want clear migration path from legacy patterns

- **Acceptance Criteria**:
  - Runtime warnings for deprecated layout props
  - Clear migration timeline and documentation
  - Automated migration tooling where possible
- **Files**: Component prop types and runtime warnings
- **Definition of Done**: Clear deprecation path with 6-month timeline

## 4) Component-by-Component Task List

### Employee.Profile

- **Files**: `src/components/Employee/Profile/Profile.tsx`
- **Slot Table**: `{ Header, PersonalInfo, AddressInfo, ContactInfo, Actions }`
- **Preset**: Default form layout with validation (current behavior)
- **Compound**: `<Employee.Profile><Employee.Profile.Header /><Employee.Profile.PersonalInfo /></Employee.Profile>`
- **Render-prop**: `<Employee.Profile>{(slots, ctx) => <CustomLayout>{slots.PersonalInfo}</CustomLayout>}</Employee.Profile>`
- **Data Props**: `employeeId` (controlled), `companyId` (optional), employee data SDK-fetched via existing hooks

**TODO: Convert Employee.Profile to progressive composition pattern**

- **Files**: `src/components/Employee/Profile/Profile.tsx`, create subcomponent files
- **Criteria**: Maintains existing `ProfileProps` interface, adds composition support, exports compound components
- **Definition of Done**: All existing tests pass, new composition modes tested, Ladle stories added

### Employee.Compensation

- **Files**: `src/components/Employee/Compensation/Compensation.tsx`
- **Slot Table**: `{ Header, SalaryInfo, PayFrequency, EffectiveDate, Actions }`
- **Preset**: Salary/wage form with pay frequency
- **Compound**: Configurable field order and grouping
- **Render-prop**: Custom layout with compensation calculator integration

**TODO: Convert Employee.Compensation to progressive composition pattern**

### Employee.Taxes

- **Files**: `src/components/Employee/Taxes/Taxes.tsx`
- **Slot Table**: `{ Header, FederalTaxes, StateTaxes, Summary, Actions }`
- **Preset**: Standard tax withholding forms
- **Compound**: Separate federal/state sections
- **Render-prop**: Custom tax form layout with compliance warnings

**TODO: Convert Employee.Taxes to progressive composition pattern**

### Employee.PaymentMethod

- **Files**: `src/components/Employee/PaymentMethod/PaymentMethod.tsx`
- **Slot Table**: `{ Header, PaymentType, BankAccount, SplitPayment, Actions }`
- **Preset**: Direct deposit setup form
- **Compound**: Payment type selection with conditional forms
- **Render-prop**: Custom payment flow with validation

**TODO: Convert Employee.PaymentMethod to progressive composition pattern**

### Company.OnboardingOverview

- **Files**: `src/components/Company/OnboardingOverview/OnboardingOverview.tsx`
- **Slot Table**: `{ Header, ProgressIndicator, StepList, ContinueAction }`
- **Preset**: Standard onboarding progress view
- **Compound**: Custom progress indicator and step presentation
- **Render-prop**: Fully custom overview layout

**TODO: Convert Company.OnboardingOverview to progressive composition pattern**

### Company.Locations

- **Files**: `src/components/Company/Locations/Locations.tsx`
- **Slot Table**: `{ Header, LocationList, LocationForm, Actions }`
- **Preset**: List-to-form workflow for business locations
- **Compound**: Separate list management and form components
- **Render-prop**: Custom location management interface

**TODO: Convert Company.Locations to progressive composition pattern**

_(Continue for all remaining views...)_

## 5) Documentation Plan

#### Epic: Progressive Composition Documentation

**Goal**: Provide comprehensive documentation for progressive composition patterns.

**Story DOC-1**: As a developer, I want to understand progressive composition patterns and conventions

- **Acceptance Criteria**:
  - Document all three composition modes with examples
  - Establish slot naming conventions and standards
  - Provide before/after migration examples
  - Include best practices and common patterns
- **File**: `docs/progressive-composition-standard.md`
- **Definition of Done**: Complete progressive composition reference guide

**Story DOC-2**: As a developer, I want to understand how to integrate navigation with any router

- **Acceptance Criteria**:
  - Update existing routing guide with Navigator patterns
  - Document React Router and TanStack Router adapters
  - Provide step-based navigation examples
  - Include custom router adapter creation guide
- **File**: `docs/integration-guide/routing.md`
- **Definition of Done**: Navigation works seamlessly with popular routers

#### Epic: Flow System Documentation

**Goal**: Document enhanced Flow system capabilities and usage.

**Story DOC-3**: As a developer, I want to understand enhanced Flow capabilities

- **Acceptance Criteria**:
  - Document navigation integration with existing robot3 machines
  - Explain external FSM integration (XState, Zustand)
  - Provide real-world workflow examples
  - Include troubleshooting and debugging guides
- **File**: `docs/flows-guide.md`
- **Definition of Done**: Complete Flow system documentation

#### Epic: Component Adapter Enhancement Documentation

**Goal**: Document slot-level customization alongside existing component adapters.

**Story DOC-4**: As a developer, I want to understand slot-level customization options

- **Acceptance Criteria**:
  - Document slot override patterns
  - Explain relationship between slot overrides and global component adapters
  - Provide mixing strategies and best practices
  - Include performance considerations
- **File**: `docs/component-adapter/slot-overrides.md`
- **Definition of Done**: Clear guidance on customization strategies

#### Epic: Migration and Adoption Documentation

**Goal**: Provide clear migration path for existing SDK users.

**Story DOC-5**: As an existing SDK user, I want step-by-step migration guidance

- **Acceptance Criteria**:
  - Map legacy props to new composition patterns
  - Provide incremental adoption strategy
  - Document breaking changes with timeline
  - Include automated migration tooling
- **File**: `docs/migration-guide-progressive-composition.md`
- **Definition of Done**: Smooth migration path for all existing users

## 6) Validation Plan

#### Epic: Comprehensive Test Coverage

**Goal**: Ensure all progressive composition features are thoroughly tested.

**Story TEST-1**: As a developer, I want confidence that all composition modes work identically

- **Acceptance Criteria**:
  - Unit tests for all 3 composition modes on every component
  - Tests verify identical output and behavior across modes
  - Slot override functionality fully tested
  - Event handling and navigation integration tested
- **Files**: `*.test.tsx` files for each converted component
- **Definition of Done**: 100% test coverage for composition modes with identical assertions

**Story TEST-2**: As a developer, I want integration tests for complete workflows

- **Acceptance Criteria**:
  - End-to-end workflow testing with navigation
  - Router integration testing (React Router, TanStack Router)
  - External FSM integration testing
  - Performance regression testing
- **Files**: `src/test/integration/progressive-composition.test.tsx`
- **Definition of Done**: Full workflow integration tests pass consistently

#### Epic: Interactive Development Examples

**Goal**: Provide live, interactive examples for all progressive composition features.

**Story DEMO-1**: As a developer exploring the SDK, I want interactive examples of all composition modes

- **Acceptance Criteria**:
  - Ladle stories for each view in all 3 composition modes
  - Interactive slot customization examples
  - Router adapter demonstration stories
  - Real-time composition mode switching
- **Files**: Update all `*.stories.tsx` files
- **Definition of Done**: Complete interactive documentation via Ladle

**Story DEMO-2**: As a developer evaluating the SDK, I want complete example applications

- **Acceptance Criteria**:
  - Example apps demonstrating React Router integration
  - Example apps demonstrating TanStack Router integration
  - Custom FSM usage examples
  - Side-by-side composition mode comparisons
- **Files**: Example apps in documentation or separate repository
- **Definition of Done**: Production-ready example applications

## 7) Migration Guide

### Legacy Props to Slot Overrides

- **Layout Props**: Convert `showHeader={false}` to `components={{ Header: () => null }}`
- **Custom Components**: Map `CustomButton` props to slot-level overrides
- **Conditional Rendering**: Replace with render-prop mode for maximum control

### Introducing Navigator

- **Gradual Adoption**: Navigator prop optional, falls back to onEvent
- **Router Adapter Setup**: One-time setup per application
- **Event Compatibility**: Existing onEvent callbacks continue working

### GEP.Flow Adoption

- **Incremental Wrapping**: Wrap existing flows without changes
- **External FSM Migration**: Gradual transition from onEvent to FSM integration
- **State Machine Compatibility**: Existing robot3 machines work unchanged

## 8) Risk and Mitigation

### Router Lock-in Risk

- **Risk**: SDK becomes tied to specific router implementation
- **Mitigation**: Navigator abstraction with adapter pattern, multiple adapter implementations

### Inconsistent Slot Naming

- **Risk**: Different slot names across similar views confuse developers
- **Mitigation**: Naming convention guide, ESLint rule for slot naming consistency, standardized slot map exports

### Partner Churn

- **Risk**: Breaking changes cause partner migration effort
- **Mitigation**: Additive changes only, 6-month deprecation window, comprehensive migration tooling

### Performance Impact

- **Risk**: Additional abstraction layers slow rendering
- **Mitigation**: Benchmarking during development, lazy loading for unused slots, memoization strategies

### State Management Complexity

- **Risk**: Dual FSM support complicates state handling
- **Mitigation**: Clear separation of concerns, extensive testing, fallback to current behavior

---

This plan provides a comprehensive roadmap for implementing progressive composition with router-agnostic navigation and flow-aware wrappers while maintaining backward compatibility and providing clear migration paths for existing partners.
