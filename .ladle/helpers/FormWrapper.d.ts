import type React from 'react';
type FormWrapperProps<T extends Record<string, unknown>> = {
    children: React.ReactNode;
    defaultValues?: Partial<T>;
    mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
    actionName?: string;
};
export declare const FormWrapper: <T extends Record<string, unknown> = Record<string, unknown>>({ children, defaultValues, mode, actionName, }: FormWrapperProps<T>) => import("react/jsx-runtime").JSX.Element;
export {};
