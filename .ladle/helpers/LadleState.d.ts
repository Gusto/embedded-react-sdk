/**
 * Creates a handler that logs actions to Ladle's action panel and manages component state
 * @param actionName The name of the action to display in Ladle
 * @returns Functions and state for handling component events
 */
export declare function useLadleState<T>(actionName: string, initialValue?: T): {
    value: T | undefined;
    setValue: import("react").Dispatch<import("react").SetStateAction<T | undefined>>;
    handleChange: (newValue: T) => T;
    handleBlur: () => void;
};
