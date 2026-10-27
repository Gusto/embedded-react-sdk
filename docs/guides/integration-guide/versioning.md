---
title: Versioning
description: SDK versioning strategy, pre-1.0 SemVer behavior, what counts as a breaking change, advance-notice expectations, upgrade guides, opting out of new functionality, and where to find releases.
order: 0
---

The Gusto Embedded React SDK is committed to following the principles of [Semantic Versioning 2.0.0](https://semver.org/). It should also be understood, however, that **we are still pre-1.0.0** and [the rules of SemVer are different while we work towards 1.0.0](https://semver.org/#spec-item-4).

## Using events Pre-1.0 Versioning under SemVer

According to SemVer, versions in the 0.x.y range are considered experimental. This means that:

- **Breaking Changes Are Allowed:** You may encounter breaking changes in versions labeled as 0.x.y without a major version bump. This flexibility allows us to iterate quickly and make necessary adjustments as we gather feedback and refine the SDK.
- **Frequent Iteration:** We anticipate a more frequent release cycle during this stage, which may include breaking changes as we improve features and functionality.

## Communication and Support

To ensure a smooth experience during this transitional phase, we are dedicated to the following practices:

- **Advance Notice:** We will communicate any upcoming breaking changes well in advance, allowing you time to prepare for adjustments.
- **Upgrade Guides:** Each breaking change will come with a comprehensive upgrade guide to help you transition your code with minimal friction.

## Opting Out of New Functionality

Some released functionality replaces existing SDK behavior and ships behind a flag on the `features` prop of `GustoProvider`. Every flag defaults to `true`. To keep the previous behavior while you prepare for the change, set the flag to `false`:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/proxy-url/' }} features={{ regularRateOfPay: false }}>
      ...
    </GustoProvider>
  )
}
```

Flags are temporary. Each one is removed in a future release, after which its functionality can no longer be turned off. See [`Features`](../../reference/providers.md#features) for the current flags and what each one covers.

## Staying Informed

You can track all releases and their details in our [CHANGELOG](https://www.npmjs.com/package/@gusto/embedded-react-sdk?activeTab=code). We encourage you to stay updated and provide feedback as we work towards a stable 1.0 release. Your input is invaluable in shaping the SDK to better meet your needs.

Thank you for your understanding and support as we navigate this exciting phase of development! We look forward to collaborating with you to create a robust and user-friendly SDK.
