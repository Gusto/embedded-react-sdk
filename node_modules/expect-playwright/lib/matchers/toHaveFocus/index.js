"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toHaveFocus = async function (...args) {
    try {
        const [elementHandle] = await utils_1.getElementHandle(args, 0);
        /* istanbul ignore next */
        const isFocused = await elementHandle.evaluate((el) => el === document.activeElement);
        return {
            pass: isFocused,
            message: () => utils_1.getMessage(this, "toHaveFocus", true, isFocused, ""),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toHaveFocus;
