# Deductions State Machine - Code Review Todo

## Major Issues to Fix

### 1. Remove Console.log Statements from Production Code

- [x] Remove console.log from stateMachine.ts lines 25-26
- [x] Remove console.log from stateMachine.ts lines 95-99
- [x] Remove console.log from DeductionsListComponent.tsx line 54

### 2. Fix Race Condition in Auto-redirect useEffect

- [x] Remove `onEvent` from useEffect dependency array in DeductionsListComponent.tsx
- [x] Add error handling to the auto-redirect logic
- [x] Add cleanup function to prevent memory leaks

### 3. Use Consistent Reducer Patterns

- [x] Replace inline reducers with createReducer helper in stateMachine.ts
- [x] Ensure all transitions use the same pattern for consistency

### 4. Performance Optimization

- [x] Memoize hasExistingDeductions calculation in Deductions.tsx
- [ ] Consider extracting state names to constants

## Minor Improvements (Optional)

- [ ] Add better comments for business logic
- [ ] Consider extracting state names to constants
- [ ] Review EventPayloads type safety
