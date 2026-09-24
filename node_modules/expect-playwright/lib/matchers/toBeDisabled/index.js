"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toBeDisabled = async function (...args) {
    try {
        const [elementHandle] = await utils_1.getElementHandle(args, 0);
        const isDisabled = await elementHandle.isDisabled();
        return {
            pass: isDisabled,
            message: () => utils_1.getMessage(this, "toBeDisabled", true, isDisabled, ""),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toBeDisabled;
