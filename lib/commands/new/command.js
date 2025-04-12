"use strict";
const node_child_process_1 = require("node:child_process");
module.exports = class {
    async execute(args) {
        // Calls "npx makes aurelia/v1"
        // https://github.com/aurelia/v1
        (0, node_child_process_1.spawn)('npx', ['makes', 'aurelia/v1', ...args], { stdio: 'inherit', shell: true });
    }
};
//# sourceMappingURL=command.js.map