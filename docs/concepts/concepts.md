---
title: Core Concepts
sidebar_position: 1
---

This section covers the core concepts you need to understand when building with the Gusto Embedded React SDK.

- [**Flows and Blocks**](./flows-and-blocks.md) — The SDK provides two levels of components: Flows handle entire multi-step user journeys out of the box, while Blocks give you individual steps for custom composition.

- [**Provider and Configuration**](./provider-and-configuration.md) — Every SDK integration starts with `GustoProvider`, which configures your API proxy, theming, i18n, and component adapters.

- [**Events**](./events.md) — Components communicate through a unified event system, emitting typed events for user interactions, API responses, and step completions.

- [**Authentication and Proxy**](./authentication-and-proxy.md) — The SDK routes all API calls through your backend proxy, where you handle OAuth2 tokens and enforce user-level authorization.

- [**Composition**](./composition.md) — Build custom flows by composing individual Blocks, reordering steps, and integrating with your router.

- [**Theming and Customization**](./theming-and-customization.md) — Match the SDK to your brand using CSS variable theming, or replace UI primitives entirely with component adapters.

- [**Error Handling**](./error-handling.md) — The SDK handles errors at multiple layers: form validation, API errors, error boundaries, and observability hooks for production monitoring.

- [**Internationalization**](./i18n.md) — Override any user-facing string via the `dictionary` prop, with full TypeScript support for key discovery.
