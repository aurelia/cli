"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAliases = exports.fromDotDot = exports.toDotDot = void 0;
// if moduleId is above surface (default src/), the '../../' confuses hell out of
// requirejs as it tried to understand it as a relative module id.
// replace '..' with '__dot_dot__' to enforce absolute module id.
const toDotDot = (moduleId) => moduleId.split('/').map(p => p === '..' ? '__dot_dot__' : p).join('/');
exports.toDotDot = toDotDot;
const fromDotDot = (moduleId) => moduleId.split('/').map(p => p === '__dot_dot__' ? '..' : p).join('/');
exports.fromDotDot = fromDotDot;
const getAliases = (moduleId, paths) => {
    const aliases = [];
    const _moduleId = (0, exports.fromDotDot)(moduleId);
    for (let i = 0, keys = Object.keys(paths); i < keys.length; i++) {
        const key = keys[i];
        const target = paths[key];
        if (key === 'root')
            continue;
        if (key === target)
            continue;
        if (_moduleId.startsWith(target + '/')) {
            aliases.push({
                fromId: (0, exports.toDotDot)(key + _moduleId.slice(target.length)),
                toId: (0, exports.toDotDot)(moduleId)
            });
        }
    }
    return aliases;
};
exports.getAliases = getAliases;
//# sourceMappingURL=module-id-processor.js.map