"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareText = exports.getMessage = exports.quote = exports.getElementHandle = exports.getFrame = void 0;
const isElementHandle = (value) => {
    return value.constructor.name === "ElementHandle";
};
const isLocator = (value) => {
    return value.constructor.name === "Locator";
};
const getFrame = async (value) => {
    const resolved = await value;
    return isElementHandle(resolved)
        ? resolved.contentFrame()
        : resolved;
};
exports.getFrame = getFrame;
const isObject = (value) => typeof value === "object" && !(value instanceof RegExp);
const getElementHandle = async (args, valueArgCount = 1) => {
    var _a, _b;
    // Pluck the options off the end first
    const options = args.length > 1 && isObject(args[args.length - 1])
        ? args.pop()
        : {};
    // Next, pluck the number of args required by the matcher (defaults to 1)
    const expectedValue = args.splice(-valueArgCount, valueArgCount);
    // Finally, we can find the element handle
    let handle = await args[0];
    handle = (_a = (await exports.getFrame(handle))) !== null && _a !== void 0 ? _a : handle;
    if (isLocator(handle)) {
        handle = (await handle.elementHandle());
    }
    // If the user provided a page or iframe, we need to locate the provided
    // selector or the `body` element if none was provided.
    else if (!isElementHandle(handle)) {
        const selector = (_b = args[1]) !== null && _b !== void 0 ? _b : "body";
        try {
            handle = (await handle.waitForSelector(selector, options));
        }
        catch (err) {
            throw new Error(`Timeout exceed for element ${exports.quote(selector)}`);
        }
    }
    return [handle, expectedValue];
};
exports.getElementHandle = getElementHandle;
const quote = (val) => (val === null ? "" : `'${val}'`);
exports.quote = quote;
const getMessage = ({ isNot, promise, utils, expand }, matcher, expected, received, expectedHint = undefined) => {
    const message = isNot
        ? `Expected: not ${utils.printExpected(expected)}`
        : utils.printDiffOrStringify(expected, received, "Expected", "Received", expand);
    return (utils.matcherHint(matcher, undefined, expectedHint, { isNot, promise }) +
        "\n\n" +
        message);
};
exports.getMessage = getMessage;
const compareText = (expectedValue, actualValue) => {
    return typeof expectedValue === "string"
        ? expectedValue === actualValue
        : expectedValue.test(actualValue !== null && actualValue !== void 0 ? actualValue : "");
};
exports.compareText = compareText;
