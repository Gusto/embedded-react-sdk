---
title: Integration Guide
---

The integration guide covers the key concepts for building with the Gusto Embedded React SDK. The SDK is designed to be flexible -- you can use workflow components as-is for a quick start, or customize every aspect of the experience to match your application. The sections below walk through each integration surface area, from versioning and event handling to theming and error tracking.

| Section                                                 | Description                                                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Versioning and Dependency Management](./versioning.md) | Our versioning strategy, release types, and definition of breaking changes                                                                                                                              |
| [Event Handling](./event-handling.md)                   | How to work with SDK events, useful for: Tracking and analytics Running side effects in your app ([Event Types Reference](./event-types.md))                                                            |
| [Request Interceptors](./request-interceptors.md)       | How to customize request and response handling for authentication, logging, and other cross-cutting concerns                                                                                            |
| [Customizing SDK UI](./customizing-sdk-ui.md)           | How to customize the look of SDK components to visually match your application                                                                                                                          |
| [Composition](./composition.md)                         | How to customize the layout, structure, and organization of SDK components, useful for Adding or removing sections from a given step or interface Inserting your own content inside of an SDK component |
| [Providing Your Own Data](./providing-your-own-data.md) | How to supply your own data to SDK forms                                                                                                                                                                |
| [Translation](./translation.md)                         | How to customize copy within SDK components and support for internationalization                                                                                                                        |
| [Routing](./routing.md)                                 | Example of integrating the SDK with your application router                                                                                                                                             |
| [Error Handling](./error-handling.md)                   | How does SDK handle internal errors                                                                                                                                                                     |
