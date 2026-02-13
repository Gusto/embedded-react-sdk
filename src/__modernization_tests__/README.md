# Modernization Safety Net Tests

**This folder is TEMPORARY.**

These integration tests serve as a "refactor safety net" during the SDK modernization effort. They verify that each block component's behavior remains unchanged as we extract `useXxx` hooks and `*Presentation.tsx` files.

## Purpose

Before refactoring any block, we ensure integration tests exist that cover its current behavior. After each refactor step (hook extraction, presentation extraction), we run the tests to confirm nothing broke.

## Rules

1. Write the integration test BEFORE touching any block code
2. Verify the test passes on the CURRENT (unmodified) code
3. After each refactor step, run the test -- it MUST pass
4. Tests should cover: rendering, user interactions, event dispatching, loading states

## When to Delete

Once the full modernization is 100% complete and the permanent test suite covers the same behaviors, this entire folder should be deleted:

1. Verify all tests in this folder still pass
2. Confirm the permanent test suite covers equivalent behaviors
3. Delete `src/__modernization_tests__/` entirely

## Tracking

Task progress is tracked in the Notion database:
https://www.notion.so/306ad673c6c28121a9e4d68cf03e89cd
