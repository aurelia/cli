"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
const tty = __importStar(require("node:tty"));
let size;
module.exports = function () {
    // Only run it once.
    if (size)
        return size;
    let width;
    let height;
    if (tty.isatty(1) && tty.isatty(2)) {
        if (process.stdout.getWindowSize) {
            [width, height] = process.stdout.getWindowSize();
        }
        else if ("getWindowSize" in tty && typeof tty.getWindowSize === "function") {
            [height, width] = tty.getWindowSize();
        }
        else if (process.stdout.columns && process.stdout.rows) {
            height = process.stdout.rows;
            width = process.stdout.columns;
        }
    }
    else {
        width = 80;
        height = 100;
    }
    size = { height: height, width: width };
    return size;
};
//# sourceMappingURL=get-tty-size.js.map