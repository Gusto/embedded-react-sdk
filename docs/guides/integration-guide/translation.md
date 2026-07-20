---
title: Translation
description: Override SDK component copy and add new locales using the dictionary prop on GustoProvider, backed by an isolated i18next instance for internationalization.
order: 5
---

The Gusto Embedded React SDK supports translation of all strings present in the UI. Translations can be used for internationalization. They can also be used to customize text according to the needs of your application.

## i18Next

We use [i18next](https://www.i18next.com/) to implement translations. If you are also leveraging i18next, we create our own independent instance to avoid conflicting with the one already present in your application.

## Supplying your own translations

You can use the `dictionary` prop on the `GustoProvider` to set translations. The top level key represents the language being used (“en” by default). Each string in the UI has a key and corresponding default text. Let’s go through an example updating the `Employee.PaymentMethod` component.

For example, take the payment details step from the Employee Onboarding Flow. Initially it renders with the following copy:

![Payment details step with default copy](https://files.readme.io/60f9722f17827245dfcbf39e4f3789f283553f90a51e205c93ec26aa1f12943d-image.png)

<br />

We can update any text on this page by overriding the text strings in the dictionary. Here is an example updating the title and CTA text.

```jsx
import { EmployeeOnboardingFlow } from '@gusto/embedded-react-sdk';

function MyApp({ companyId }) {
  return(
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
      dictionary={{
        en: {
          'Employee.PaymentMethod': {
            title: 'Please provide your payment information',
            submitCta: 'Next step',
          },
        },
      }}
    >
      <EmployeeOnboardingFlow companyId={companyId} onEvent={() => {...}} />
    </GustoProvider>
  );
}
```

Which results in the following:

![Payment details step rendered with overridden dictionary copy](https://files.readme.io/9b2c1714d6cc54f6ba776ce547d05513f01c5bc200324ca41eb3cf0876c1f118-image.png)

We could provide custom text in a similar manner for any copy on the page.

## Viewing available translations

For a complete, browseable list of every overridable string, see the [Translations reference](../../reference/Translations/index.md). Each i18n namespace (e.g. `Employee.PaymentMethod`) has its own section listing every key alongside its default English copy — these are exactly the keys you supply under `dictionary`.

Every dictionary entry is also fully typed. As you type a namespace or key, your IDE surfaces the available options:

![IDE autocomplete showing typed dictionary entries](https://files.readme.io/8868a0a3673f6a34d8f6da8e1592f36d0ed7d7c98c333d1e13f72a2c4ccc042b-image.png)
