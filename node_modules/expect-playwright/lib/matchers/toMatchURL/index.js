"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toMatchURL = async function (page, expectedUrl) {
    const frame = await utils_1.getFrame(page);
    const actualUrl = frame.url();
    return {
        pass: utils_1.compareText(expectedUrl, actualUrl),
        message: () => utils_1.getMessage(this, "toMatchURL", expectedUrl, actualUrl),
    };
};
exports.default = toMatchURL;
