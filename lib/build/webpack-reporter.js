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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportReadiness = reportReadiness;
async function reportReadiness(options) {
    const uri = await createDomain(options);
    const yargs = await Promise.resolve().then(() => __importStar(require('yargs')));
    const argv = yargs.argv;
    argv.color = await Promise.resolve().then(() => __importStar(require('supports-color')));
    const useColor = argv.color;
    let startSentence = `Project is running at ${colorInfo(useColor, uri)}`;
    if (options.socket) {
        startSentence = `Listening to socket at ${colorInfo(useColor, options.socket)}`;
    }
    console.log((argv.progress ? '\n' : '') + startSentence);
    console.log(`webpack output is served from ${colorInfo(useColor, options.publicPath)}`);
    const contentBase = Array.isArray(options.contentBase) ? options.contentBase.join(', ') : options.contentBase;
    if (contentBase) {
        console.log(`Content not from webpack is served from ${colorInfo(useColor, contentBase)}`);
    }
    if (options.historyApiFallback) {
        console.log(`404s will fallback to ${colorInfo(useColor, options.historyApiFallback.index || '/index.html')}`);
    }
}
;
async function createDomain(opts) {
    const protocol = opts.https ? 'https' : 'http';
    const url = await Promise.resolve().then(() => __importStar(require('node:url')));
    // the formatted domain (url without path) of the webpack server
    return opts.public ? `${protocol}://${opts.public}` : url.format({
        protocol: protocol,
        hostname: opts.host,
        port: opts.socket ? 0 : opts.port.toString()
    });
}
function colorInfo(useColor, msg) {
    if (useColor) {
        // Make text blue and bold, so it *pops*
        return `\u001b[1m\u001b[33m${msg}\u001b[39m\u001b[22m`;
    }
    return msg;
}
//# sourceMappingURL=webpack-reporter.js.map