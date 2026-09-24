import { type Theme } from '@inquirer/core';
import type { PartialDeep } from '@inquirer/type';
type ConfirmConfig = {
    message: string;
    default?: boolean | undefined;
    transformer?: (value: boolean) => string;
    theme?: PartialDeep<Theme<ConfirmTheme>>;
};
type ConfirmTheme = {
    /**
     * Words accepted as "yes" and "no" answers. Matching is prefix-based and
     * case-insensitive, and the first character of each word is shown in the
     * hint. These words are also displayed once the prompt is answered.
     */
    keywords: {
        yes: string;
        no: string;
    };
    style: {
        /**
         * Style the character representing the default answer in the hint (e.g.
         * "Y/n"). Uppercases it by default; scripts without case (e.g. Chinese)
         * are highlighted with a color instead.
         */
        confirmDefault: (text: string) => string;
    };
};
declare const _default: import("@inquirer/type").Prompt<boolean, {
    message: string;
    default?: boolean | undefined | undefined;
    transformer?: ((value: boolean) => string) | undefined;
    theme?: PartialDeep<Theme<ConfirmTheme>> | undefined;
} & ConfirmConfig>;
export default _default;
