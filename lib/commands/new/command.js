"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
class default_1 {
    async execute(args) {
        // Calls "npx makes aurelia/v1"
        // https://github.com/aurelia/v1
        (0, node_child_process_1.spawn)('npx', ['makes', 'aurelia/v1', ...args], { stdio: 'inherit', shell: true });
    }
}
exports.default = default_1;
;
//# sourceMappingURL=command.js.map