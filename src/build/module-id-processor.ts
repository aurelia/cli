// if moduleId is above surface (default src/), the '../../' confuses hell out of
// requirejs as it tried to understand it as a relative module id.
// replace '..' with '__dot_dot__' to enforce absolute module id.
export const toDotDot = (moduleId: string) => moduleId.split('/').map(p => p === '..' ? '__dot_dot__' : p).join('/');
export const fromDotDot = (moduleId: string) => moduleId.split('/').map(p => p === '__dot_dot__' ? '..' : p).join('/');

export const getAliases = (moduleId: string, paths: AureliaJson.IPaths) => {
  const aliases: {fromId: string, toId: string}[] = [];
  const _moduleId = fromDotDot(moduleId);
  for (let i = 0, keys = Object.keys(paths); i < keys.length; i++) {
    const key = keys[i];
    const target = paths[key];
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
