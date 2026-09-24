import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
const GustoEmbeddedContext = React.createContext(null);
export function GustoEmbeddedProvider(props) {
    return (_jsx(GustoEmbeddedContext.Provider, { value: props.client, children: props.children }));
}
export function useGustoEmbeddedContext() {
    const value = React.useContext(GustoEmbeddedContext);
    if (value === null) {
        throw new Error("SDK not initialized. Create an instance of GustoEmbeddedCore and pass it to <GustoEmbeddedProvider />.");
    }
    return value;
}
//# sourceMappingURL=_context.js.map