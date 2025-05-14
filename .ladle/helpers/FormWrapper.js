import { jsx as _jsx } from "react/jsx-runtime";
import { action } from '@ladle/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styles from './FormWrapper.module.scss';
export const FormWrapper = ({ children, defaultValues = {}, mode = 'onTouched', actionName = 'Form State Changed', }) => {
    const methods = useForm({
        defaultValues: defaultValues,
        mode,
    });
    // Log form state changes using Ladle action
    useEffect(() => {
        const subscription = methods.watch((value, { name, type }) => {
            action(actionName)({
                values: value,
                name,
                type,
                errors: methods.formState.errors,
                touchedFields: methods.formState.touchedFields,
                dirtyFields: methods.formState.dirtyFields,
                isDirty: methods.formState.isDirty,
                isValid: methods.formState.isValid,
            });
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [methods, actionName]);
    const handleSubmit = (data) => {
        action('Form submitted')(data);
    };
    return (_jsx(FormProvider, { ...methods, children: _jsx("form", { className: styles.form, onSubmit: methods.handleSubmit(handleSubmit), children: children }) }));
};
