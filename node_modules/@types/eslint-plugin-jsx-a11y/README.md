# Installation
> `npm install --save @types/eslint-plugin-jsx-a11y`

# Summary
This package contains type definitions for eslint-plugin-jsx-a11y (https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#readme).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/eslint-plugin-jsx-a11y.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/eslint-plugin-jsx-a11y/index.d.ts)
````ts
import { ESLint, Linter } from "eslint";

declare const eslintPluginJsxA11y: ESLint.Plugin & {
    configs: {
        recommended: Linter.LegacyConfig;
        strict: Linter.LegacyConfig;
    };
    flatConfigs: {
        recommended: Linter.Config;
        strict: Linter.Config;
    };
};

export = eslintPluginJsxA11y;

````

### Additional Details
 * Last updated: Sat, 04 Oct 2025 10:34:35 GMT
 * Dependencies: [eslint](https://npmjs.com/package/eslint)

# Credits
These definitions were written by [Seth Murphy](https://github.com/eagerestwolf), and [Jordan Harband](https://github.com/ljharb).
