"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeHTTP = exports.mnemonic = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.mnemonic = process.env.MNEMONIC;
exports.nodeHTTP = process.env.NODE_HTTP;
//# sourceMappingURL=variables.js.map