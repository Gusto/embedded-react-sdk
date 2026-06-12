---
title: Deciding to build with the SDK
description: Considerations for choosing the React SDK over Flows or a custom API build — React stack fit, abstraction over endpoints, theming, coverage, and customization depth.
order: 1
---

## Is the GEP React SDK right for me?

If your application uses React — or can introduce React ([see how](https://react.dev/learn/add-react-to-an-existing-project)) — the SDK is the recommended build path for any [payroll workflow it covers](../workflows-overview/workflows-overview.md). You can mix and match approaches across workflows, choosing the right level of abstraction for each part of your application.

**Use the SDK if:**

- Your app is built with React, or you can add React to it
- You want pre-built, customizable UI — via [workflows](../workflows-overview/workflows-overview.md) or their sub-components — or to own your UI entirely while the SDK handles data fetching, validation, and API calls (via [hooks](../hooks/hooks.md))
- You want to pre-fill forms with data your application already has
- You need to match your design system via theming or custom components

**Consider a different approach if:**

- The workflow or hook you need doesn't have SDK coverage yet — check the [Workflows Overview](../workflows-overview/workflows-overview.md) and [Hooks](../hooks/hooks.md) for what's available, and reach out to your Gusto Embedded contact to ask about coverage on your roadmap
- Your customization requirements go beyond what hooks and component adapters can support — in that case a raw API build may be the right path, though we'd still recommend using SDK components where possible to reduce build scope

## Next steps

[**Getting Started →**](../getting-started/getting-started.md) Install the SDK and render your first component.

[**Workflows Overview →**](../workflows-overview/workflows-overview.md) See what's available end-to-end.

[**Hooks →**](../hooks/hooks.md) Explore the headless API surface.
