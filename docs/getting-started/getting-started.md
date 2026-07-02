---
title: Getting started
description: Orientation to the Gusto Embedded React SDK for product managers, designers, and evaluators—what it can do, how it customizes, and how to see it in action.
order: 1
---

The Gusto Embedded React SDK is a library of pre-built React components and headless utilities for embedding payroll experiences directly into your product.

> This page provides an overview of the SDK's capabilities. If you're a developer ready to install the SDK and explore a demo application, head to our [Quick start](./quick-start.md) instead. For a complete, runnable reference application that orchestrates SDK workflows together, see our [Example app](./example-app.md).

## What the SDK can do

Pre-built UI for the core payroll lifecycle:

| Capability                      | What's included                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Company and employee onboarding | Multi-step flows that collect business details, tax info, work and home addresses, payment methods, and form signatures. |
| Payroll runs                    | Standard, off-cycle (bonus and correction), dismissal, and transition payroll.                                           |
| Contractor management           | Contractor onboarding and contractor payments.                                                                           |
| Terminations and time off       | Dismissal payroll and time-off policy management.                                                                        |
| Information requests            | Surface the documents and inputs Gusto needs from employers, with built-in validation.                                   |

See the [Workflows overview](../guides/workflows-overview.md) for the complete, current list.

## How it adapts to your product

The SDK is designed to look and feel like part of your application, not a Gusto widget bolted on:

- **Theming:** override colors, typography, radius, shadows, and other visual tokens to match your design system
- **Component adapters:** replace any individual UI primitive (buttons, inputs, layouts) with your own components
- **Composition:** drop in entire workflows, or assemble your own page from blocks for finer control over layout and step sequencing

## How it fits into a build

The SDK offers three levels of abstraction so each part of your product can pick the right balance of speed and control:

**Workflows** add an entire multi-step experience with one React component. Fastest to ship.

**Blocks** let you build your own page layout from individual form and data components. More control, still backed by SDK logic.

**Hooks** let you own the UI entirely while the SDK handles data fetching, validation, and API calls. Maximum control.

For a full comparison of the three with tradeoffs, see [Component types](./component-types.md).
