import { type Theme } from '@inquirer/core';
import type { PartialDeep } from '@inquirer/type';
type NumberConfig<Required extends boolean = boolean> = {
    message: string;
    default?: number | undefined;
    min?: number;
    max?: number;
    step?: number | 'any';
    required?: Required;
    validate?: (value: Required extends true ? number : number | undefined) => boolean | string | Promise<string | boolean>;
    theme?: PartialDeep<Theme>;
};
declare const _default: <Required extends boolean>(config: {
    message: string;
    default?: number | undefined | undefined;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | "any" | undefined;
    required?: Required | undefined;
    validate?: ((value: Required extends true ? number : number | undefined) => boolean | string | Promise<string | boolean>) | undefined;
    theme?: PartialDeep<Theme> | undefined;
} & NumberConfig<Required>, context?: import("@inquirer/type").Context) => Promise<Required extends true ? number : number | undefined>;
export default _default;
