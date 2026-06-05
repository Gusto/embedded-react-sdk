# Flow chrome conventions

This folder hosts the generic state-machine flow plumbing (`Flow`, `FlowHeader`, `FlowContext`) and one factory for the most common header variant.

## Picking a header variant

`FlowHeaderConfig` (in [`useFlow.ts`](./useFlow.ts)) is a discriminated union with three variants:

| `type`        | When to use                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `minimal`     | Linear flow, one step at a time, optional back affordance. Best for onboarding-style flows where forward progression is the dominant motion and back is a recovery affordance. |
| `progress`    | Linear flow where you want to emphasize "how much is left." A step indicator with no inline back button. Pair with `cta` for a "Save and exit" or similar.                     |
| `breadcrumbs` | Multi-entry-point or non-linear flow where the user should be able to see and jump between sibling steps. Used by payroll/termination-style flows.                             |

If a flow has irreversible side effects on forward progression (creating a draft, charging a card, etc.), prefer `breadcrumbs` — back navigation in those flows needs an explicit user choice, not a sneaky-feeling arrow.

## Adding a destination-labeled back button (the `minimal` pattern)

Used by `Employee/OnboardingExecutionFlow`. Each step's header names the step the user will return to (e.g. on Compensation the button reads "Basic details"). The pattern:

1. **Dedicated back event.** Add a `*_BACK` constant to `componentEvents` for the flow. Don't reuse `CANCEL` — it bubbles to parent flows and gets intercepted.

   ```ts
   // src/shared/constants.ts
   EMPLOYEE_ONBOARDING_BACK: 'employee/onboarding/back',
   ```

2. **Translations namespace, one entry per step.** Create `<Domain>.<FlowName>.json` with flat keys naming each step. Run `npm run i18n:generate` after.

   ```json
   // src/i18n/en/Employee.OnboardingExecutionFlow.json
   {
     "employeeProfile": "Basic details",
     "compensation": "Compensation",
     "federalTaxes": "Federal taxes"
   }
   ```

3. **Load the namespace from the flow root.** Call `useI18n('<Domain>.<FlowName>')` once in the flow component (e.g. `OnboardingExecutionFlow.tsx`) so the bundle is registered before the back button renders.

4. **Header factory at the top of the state machine.** Use `createBackHeaderFactory` from `useFlow.ts`:

   ```ts
   const backHeaderTo = createBackHeaderFactory({
     namespace: 'Employee.OnboardingExecutionFlow',
     event: componentEvents.EMPLOYEE_ONBOARDING_BACK,
   })

   const backToProfileHeader = backHeaderTo('employeeProfile')
   const backToCompensationHeader = backHeaderTo('compensation')
   ```

5. **Set `header` per reducer, naming the back destination.** Forward transitions into a state set the header that labels _that state's_ predecessor. Back transitions do the same — when navigating into a state, set the header that labels _that state's_ predecessor.

   ```ts
   compensation: state<MachineTransition>(
     transition(
       EMPLOYEE_COMPENSATION_DONE,
       'federalTaxes',
       reduce(createReducer({ component: FederalTaxesContextual, header: backToCompensationHeader })),
     ),
     transition(
       EMPLOYEE_ONBOARDING_BACK,
       'employeeProfile',
       reduce(/* sets header back to initial / parent header */),
     ),
   ),
   ```

6. **Skip the back button on terminal states.** Set `header: null` when transitioning into a summary / final state.

## Parent-supplied first-step back affordance

When the flow is nested inside another flow (e.g. `OnboardingExecutionFlow` rendered by `OnboardingFlow`), the first step has no internal predecessor — but the parent flow often wants an "exit" affordance there (e.g. "Back to employees"). Expose an `initialBackHeader?: FlowHeaderConfig` prop on the inner flow component and:

- Use it as the initial `header` in the machine's initial context.
- Stash it in machine context (e.g. as `initialHeader`) so the reducer that lands back on step one can restore it instead of clearing the header.

See `OnboardingExecutionFlow.tsx` + `onboardingExecutionStateMachine.ts` for a working reference.

## Avoid: binding namespace via `useTranslation(ns)` for dynamic headers

`react-i18next`'s `useTranslation(ns)` caches the namespace on the hook's first render and does not re-bind when the argument changes between renders. If a header switches between different namespaces across renders (e.g. `Employee.EmployeeList` on step one, then `Employee.OnboardingExecutionFlow` on step two), the second render's `t(key)` will resolve against the first render's namespace and return the literal key.

`FlowHeader` handles this by calling `useTranslation()` once and using the per-call `t(key, { ns })` form. New header variants that need to read translations should do the same.
