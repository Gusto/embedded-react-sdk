# Changelog

## 0.6.0

- Allow for default value for flsa_status (employment type field) in compensation
- The default font that ships with the SDK has been updated to 'Geist' so that will update if you do not have a default font specified in your theme
- Update company Industry component to use speakeasy
- Update Employee List component to use speakeasy
- Add a CalendarDisplay component and introduce it to Company PaySchedule component
- Add `isSelfOnboardingEnabled` prop to Employee profile components to disallow self onboarding
- Add company PaySchedule component
- Add styling to SDK internal error component

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Update GustoApiProvider `baseUrl` property to use an absolute URL

Ex. previously you could set a `baseUrl` to a relative URL as follows

```ts
<GustoApiProvider
  config={{
    baseUrl: `some/url/path/`,
  }}
  ...
>
...
</GustoApiProvider>
```

Moving forward, we require setting an absolute URL. Ex updating to be:

```ts
<GustoApiProvider
  config={{
    baseUrl: `https://api.example.com/some/url/path/`,
  }}
  ...
>
...
</GustoApiProvider>
```

#### fontWeight override for typography theme has been changed from `book` to `regular`

Ex. so if you were overriding the `fontWeight` property before using `book`

```ts
<GustoApiProvider
  theme={{
    typography: {
      fontWeight: {
        book: 400,
      },
    },
  }}
  ...
>
...
</GustoApiProvider>
```

You will want to update to use `regular` instead as follows

```ts
<GustoApiProvider
  theme={{
    typography: {
      fontWeight: {
        regular: 400,
      },
    },
  }}
  ...
>
...
</GustoApiProvider>
```

## 0.5.0

- Update to require proxy to add IP address via `x-gusto-client-ip` header
- Responsive table style updates
- Initial speakeasy integration
- Addition of company document signer

## 0.4.1

- Fix for self onboarding profile form validation

## 0.4.0

- Added responsive behavior to foundational components
- Tables now adapt to small viewports using a card-based UI
- Adjusted theme colors for a more neutral appearance
- Fixed layout inconsistencies in buttons and modals
- Add company assign signatory form
- Add company documents list

## 0.3.0

- Updated README to include more comprehensive documentation
- Pagination for EmployeeList
- Responsive theme updates
- Increased stability

## 0.2.0

- Upgraded React to v19
