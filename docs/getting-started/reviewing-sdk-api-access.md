---
title: Reviewing SDK API access
description: Identify the API requests your SDK components and hooks use when deciding which requests to allow for a session.
---

# Reviewing SDK API access

When deciding which requests your proxy should allow for a session, you need to know which API calls support the SDK components and hooks you use. The SDK's endpoint inventory helps you identify those calls and review them against the session's permissions. See [Authentication](./authentication.md) for how your proxy authenticates users, enforces permissions, and selects Gusto tokens.

## Find the requests your integration uses

Start with the components and hooks available to the session. You can find their API calls in:

- The [endpoint reference](../guides/endpoint-reference.md), which groups components and hooks by domain and lists HTTP methods and path templates. For flows, it lists the blocks they compose; review the endpoints for those blocks.
- Individual [reference pages](../reference/index.mdx), which include endpoint lists alongside component and hook documentation.
- `@gusto/embedded-react-sdk/endpoint-inventory.json`, a generated, machine-readable inventory published with the SDK. Each block and hook entry includes endpoints and `variables` metadata for the path placeholders.

```typescript
import inventory from '@gusto/embedded-react-sdk/endpoint-inventory.json'
```

Use the inventory from the SDK version you have installed when reviewing your integration's requests.

## Identify the calls needed for the capabilities you use

A component's endpoint list can cover multiple capabilities or configurations. Review its documentation to understand which calls apply to how you use it.

For example, [ContractorOnboarding.ContractorProfile](../reference/contractor/onboarding/blocks.md#contractorprofile) supports creating a contractor and editing an existing one. Its inventory includes:

| Method | Path                                     | Capability                    |
| ------ | ---------------------------------------- | ----------------------------- |
| `POST` | `/v1/companies/:companyUuid/contractors` | Create a contractor           |
| `GET`  | `/v1/contractors/:contractorUuid`        | Read a contractor's profile   |
| `PUT`  | `/v1/contractors/:contractorUuid`        | Update a contractor's profile |

Using this component to edit an existing contractor's profile does not require granting that session permission to create contractors. Review the methods separately against the capabilities the session may use.

Also account for supporting requests. A component may read resources beyond the one it edits: for example, [ContractorOnboarding.Landing](../reference/contractor/onboarding/blocks.md#landing) reads both the contractor and company information. Review those dependencies when deciding what access the session needs, rather than assuming every request will target the employee or contractor being onboarded.

## Relate each request to the session's permissions

The inventory describes methods and path templates. Your application supplies the rules for which resources a session may access and which actions it may perform on them.

For each request you intend to support, identify the requested resource and how it relates to the session's permissions. A path such as `/v1/contractors/:contractorUuid` identifies a contractor but does not establish whether the session may access that contractor. Other operations identify resources in query parameters or request bodies. For resources such as addresses or documents, you may also need to establish their relationship to an authorized employee, contractor, or company.

An endpoint allowlist can limit the methods and paths your proxy accepts. Resource authorization still applies to each incoming request, including requests sent directly to the proxy without using an SDK component.

### If you build an allowlist from the inventory

Use each block or hook's `variables` metadata to review its path placeholders. Names are not uniform: employee identifiers may be called `employeeId` or `employeeUuid`, and company identifiers may be called `companyId` or `companyUuid`.

Give each placeholder an explicit rule. Bind resource identifiers to authorized values or check access to the requested resource. Restrict non-resource placeholders, such as `state` or `documentType`, to the values your integration supports. Reject requests with missing bindings or authorization rules; do not automatically replace unresolved placeholders with wildcards.

## Review access when upgrading the SDK

Compare endpoint inventories when upgrading, focusing on the components and hooks your integration uses. Review added or changed requests to understand which capabilities they support and whether they belong in a session's permitted requests. An endpoint appearing in a newer inventory does not automatically grant a session permission to use it.
