import { type FileOptions } from '@inquirer/external-editor';
import { type Theme } from '@inquirer/core';
import type { PartialDeep } from '@inquirer/type';
type EditorTheme = {
    validationFailureMode: 'keep' | 'clear';
    style: {
        loadingMessage: () => string;
        waitingMessage: (enterKey: string) => string;
    };
};
type EditorConfig = {
    message: string;
    default?: string | undefined;
    postfix?: string;
    waitForUserInput?: boolean;
    validate?: (value: string) => boolean | string | Promise<string | boolean>;
    file?: FileOptions;
    theme?: PartialDeep<Theme<EditorTheme>>;
};
declare const _default: import("@inquirer/type").Prompt<string, {
    message: string;
    default?: string | undefined | undefined;
    postfix?: string | undefined;
    waitForUserInput?: boolean | undefined;
    validate?: ((value: string) => boolean | string | Promise<string | boolean>) | undefined;
    file?: FileOptions | undefined;
    theme?: PartialDeep<Theme<EditorTheme>> | undefined;
} & EditorConfig>;
export default _default;
