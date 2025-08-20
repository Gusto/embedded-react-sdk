---
title: Deciding to build with the SDK
order: 1
---

## How do I know if the GEP React SDK is right for me?

While it’s possible to mix and match the build approach _across_ the domain of your payroll application, you would still generally want to match your needs to the best approach out of the possible build options (SDK, Flows, or build your own UI) for any given domain within the payroll application. As our SDK components are still in an early phase of development, many components may not yet be available via SDK (discuss with your Gusto point of contact if you’d like to inquire about a specific component).

Here are some considerations when deciding whether or not to use the React SDK for any given payroll workflow for your application:

**You should use the React SDK if…**

- If you already use React in your application, or are open to introducing React into your stack ([Learn how to add React to existing projects](<[https://react.dev/](https://react.dev/learn/add-react-to-an-existing-project)>))
- You want to use pre-built components that abstract API endpoint complexity
- You already capture info required for a particular workflow (e.g. company onboarding)
- You want to customize components to your application’s theme and layout
- You’re just starting out with building embedded payroll on GEP, or the components you want to use are currently available via the SDK library

**You may benefit from a different build approach if…**

- You need to deploy a proof of concept as soon as possible, even if the resulting application feels inconsistent in look and feel and non-integrated with the rest of your application (e.g. data that you already have may be requested again).
  - If your number one priority is speed, you may need to use [Flows](https://docs.gusto.com/embedded-payroll/docs/flows-intro) instead, as it is still the fastest way to deploy any given workflow.
- You have very deep customization needs that may not be met by the React SDK (if in doubt, ask your Gusto Embedded point of contact!). You may need to create a custom, API-only build to accommodate your requirements, but we would still highly recommend using SDK or Flow components where possible to reduce your build workload.
- The SDK component you need currently does not yet exist: we are actively working on several components to cover the rest of our application - for what’s currently available, see the Workflows Overview section and reach out to your Gusto Embedded point of contact for more information!

### How can I learn more about React SDK?

As a Gusto Embedded partner, we will provide consultation with a GEP Solutions Architect to ensure we can find the right solution for you. We recommend starting with the documentation sections provided, and please reach out to your Gusto Embedded representative to learn more!
