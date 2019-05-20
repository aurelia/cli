import project from '../aurelia.json';
import replace from 'gulp-replace';
import path from 'path';

export const processAliasesToAbsolutePaths = (
  aliases,
  root = path.join(__dirname, '../../'),
  srcRoot = path.join(root, 'src'),
  aliasRoot = aliases.root
) => {
  const absoluteAliasRoot = path.join(root, aliasRoot);

  const absoluteAliases = {};

  for (const [alias, aliasPath] of Object.entries(aliases)) {
    if (alias === 'root') {
      continue;
    }
    absoluteAliases[alias] = path.join(srcRoot, path.relative(srcRoot, path.join(absoluteAliasRoot, aliasPath)));
  }

  return absoluteAliases;
};

export const processMarkupAlias = ({
  aliases,
  file,
  match,
  requirePath,
  verbose = false
}) => {
  const potentialAlias = requirePath.split('/').shift() || '';

  if (potentialAlias in aliases) {
    const relativePath = path.relative(file.dirname, aliases[potentialAlias]).replace(/\\/g, '/') || '.';
    const replacement = match.replace(potentialAlias, relativePath);

    if (verbose) {
      console.log(`Processing alias
                        File: ${file.basename}
                        Alias: ${potentialAlias} in "${match}".
                        Replacing with: "${replacement}"`);
    }
    match = replacement;
  }

  return match;
};

const absoluteAliases = processAliasesToAbsolutePaths(project.paths);
export function processMarkupAliases(verbose = false) {
  return replace(/require from="(.*)"/g, function(match, requirePath) {
    return processMarkupAlias({ aliases: absoluteAliases, file: this.file, match, requirePath, verbose });
  });
}
