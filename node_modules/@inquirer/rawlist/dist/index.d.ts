import { Separator, type Theme } from '@inquirer/core';
import type { PartialDeep } from '@inquirer/type';
type RawlistTheme = {
    style: {
        description: (text: string) => string;
    };
};
type Choice<Value> = {
    value: Value;
    name?: string;
    short?: string;
    key?: string;
    description?: string;
};
type RawlistConfig<Value> = {
    message: string;
    choices: ReadonlyArray<Value | Choice<Value> | Separator>;
    loop?: boolean;
    theme?: PartialDeep<Theme<RawlistTheme>>;
    default?: NoInfer<Value>;
};
declare const _default: <const Value>(config: {
    message: string;
    choices: readonly (Separator | Value | Choice<Value>)[];
    loop?: boolean | undefined;
    theme?: PartialDeep<Theme<RawlistTheme>> | undefined;
    default?: NoInfer<Value> | undefined;
} & RawlistConfig<Value>, context?: import("@inquirer/type").Context) => Promise<Value>;
export default _default;
export { Separator } from '@inquirer/core';
