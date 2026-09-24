"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toBeEnabled = async function (...args) {
    try {
        const [elementHandle] = await utils_1.getElementHandle(args, 0);
        const isEnabled = await elementHandle.isEnabled();
        return {
            pass: isEnabled,
            message: () => utils_1.getMessage(this, "toBeEnabled", true, isEnabled, ""),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toBeEnabled;
