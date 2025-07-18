---
title: Build Pathways - SDK, Flows, & API
---

## How do I decide how I want to build payroll on GEP?

Payroll is a very comprehensive product, involving multiple workflows and UI aspects that must be built in order for your customers to:

1. Provide all the inputs into payroll (e.g. employees, addresses, pay schedules, etc.)
2. Run the various types of payrolls (e.g. regular, off cycle, dismissal etc.)
3. Manage payroll and the associated data afterward.

An approximation of the most important workflows in a comprehensive payroll product can be found in our Flows list - [see here and try them out](https://docs.gusto.com/embedded-payroll/docs/flow-types)!

Of course, this can be very time consuming to build. To cover this ground, GEP offers _three_ approaches to building your payroll product, which you can mix-and-match for various aspects of your application - depending on your needs for each workflow:

| Approach          | Pros                                                                                                                                           | Cons                                                                            | Documentation                                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom (API only) | Full coverage for all of GEP’s capabilities<br/>Full customization of your application                                                         | Requires you to build the UI<br/>Requires understanding of individual endpoints | [GEP API Reference](https://docs.gusto.com/embedded-payroll/reference)                                                                                                                       |
| Flows via iframe  | Fastest way to deploy any given workflow - all of the needed logic and API linkage already built in                                            | Limited customizability beyond basic look and feel                              | [List of available Flows via iframe](https://docs.gusto.com/embedded-payroll/docs/flow-types)<br/>[Flow customization options](https://docs.gusto.com/embedded-payroll/docs/customize-flows) |
| React SDK         | Strikes the balance between Custom (API only) and Flows - enables more customization than Flows, and abstracts away logic around API endpoints | Workflows are limited but planned on our developer roadmap                      | See the other sections of this guide!                                                                                                                                                        |
