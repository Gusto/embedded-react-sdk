"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toEqualUrl = async function (page, expectedUrl) {
    const frame = await utils_1.getFrame(page);
    const actualUrl = frame.url();
    return {
        pass: actualUrl === expectedUrl,
        message: () => utils_1.getMessage(this, "toEqualUrl", expectedUrl, actualUrl),
    };
};
exports.default = toEqualUrl;
