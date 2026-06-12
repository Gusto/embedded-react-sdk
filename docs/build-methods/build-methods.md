---
title: Build methods
description: Three ways to build with the Gusto Embedded React SDK — workflows, sub-components, and hooks — and how to pick the right one for each surface.
order: 0
---

# Build methods

The SDK exposes the same payroll surfaces at three levels of integration depth. Each one trades control for effort: workflows do the most for you, hooks give you the most say.

| Method                                | What you write                                             | What the SDK handles                                                         | Customizable                                          |
| ------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| [Workflows](./workflows.md)           | A single component drop-in, plus IDs and an event handler  | Step routing, data fetching, validation, submission, error handling, layout  | Theming, copy, the surface's public props             |
| [Sub-components](./sub-components.md) | One component per step, wired together by your own routing | Data fetching, validation, submission, error handling, the step's own layout | The above, plus step order and which steps to include |
| [Hooks](./hooks.md)                   | Your own layout, your own copy, your own field arrangement | Data fetching, validation, submission, error handling                        | Everything visual                                     |

## When to pick which

**Pick a workflow when…**

- You want a complete surface live as quickly as possible.
- The default order of steps and the default copy work for the experience you're building.
- You don't need to insert your own screens into the middle of the flow.

**Pick sub-components when…**

- You want to reorder, remove, or insert your own steps in between the SDK's steps.
- You only need part of a surface — for example, an "Edit profile" page that reuses the Profile step without the rest of onboarding.
- You're building a multi-step experience whose shape doesn't match any of the shipped workflows but whose individual steps do.

**Pick hooks when…**

- The default layout of a sub-component doesn't fit the design you need.
- You want to control labels, helper text, field grouping, or where the submit button lives.
- You're embedding fields into a form shell that's already part of your app (a side panel, a wizard with its own chrome, a multi-column layout).
- You need to do something between validation and submission — e.g. show a confirmation step or capture additional data.

## You can mix and match

These methods aren't mutually exclusive across a single app — or even a single surface. A common pattern is to start with the workflow drop-in to get something shipping, then swap one or two steps out for sub-components or hooks as the design evolves. The data model and event shapes are consistent across all three layers, so moving down a level doesn't require rewriting how the rest of the app integrates.
