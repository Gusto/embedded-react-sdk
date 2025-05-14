import { action } from '@ladle/react';
import { useState } from 'react';
/**
 * Creates a handler that logs actions to Ladle's action panel and manages component state
 * @param actionName The name of the action to display in Ladle
 * @returns Functions and state for handling component events
 */
export function useLadleState(actionName, initialValue) {
    const [value, setValue] = useState(initialValue);
    const handleChange = (newValue) => {
        action(actionName)(newValue);
        setValue(newValue);
        return newValue;
    };
    const handleBlur = () => {
        action(`${actionName}Blur`)('Component blurred');
    };
    return {
        value,
        setValue,
        handleChange,
        handleBlur,
    };
}
