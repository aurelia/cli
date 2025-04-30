// if moduleId is above surface (default src/), the '../../' confuses hell out of
// requirejs as it tried to understand it as a relative module id.
// replace '..' with '__dot_dot__' to enforce absolute module id.
const toDotDot = (moduleId) => moduleId.split('/').map(p => p === '..' ? '__dot_dot__' : p).join('/');
const fromDotDot = (moduleId) => moduleId.split('/').map(p => p === '__dot_dot__' ? '..' : p).join('/');

const getAliases = (moduleId, paths) => {
  const aliases = [];
  const _moduleId = fromDotDot(moduleId);
  for (let i = 0, keys = Object.keys(paths); i < keys.length; i++) {
    let key = keys[i];
    let target = paths[key];
    if (key === 'root') continue;
    if (key === target) continue;

    if (_moduleId.startsWith(target + '/')) {
      aliases.push({
        fromId: toDotDot(key + _moduleId.slice(target.length)),
        toId: toDotDot(moduleId)
      });
    }
  }

  return aliases;
};

module.exports = { toDotDot, fromDotDot, getAliases };
