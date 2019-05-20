import { VinylFile } from 'gulp-typescript/release/types';
import * as project from '../aurelia.json';
import * as replace from 'gulp-replace';
import * as path from 'path';

type Aliases = { [id: string]: string };

export const processAliasesToAbsolutePaths: (aliases: Aliases, root?: string, srcRoot?: string, aliasRoot?: string) => Aliases = (
    aliases: Aliases,
    root: string = path.join(__dirname, '../../'),
    srcRoot: string = path.join(root, 'src'),
    aliasRoot: string = aliases.root
): Aliases => {
    const absoluteAliasRoot: string = path.join(root, aliasRoot);

    const absoluteAliases: Aliases = {};

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
    verbose = false,
}: {
    aliases: Aliases;
    file: VinylFile;
    match: string;
    requirePath: string;
    verbose?: boolean;
}): string => {
    const potentialAlias: string = requirePath.split('/').shift() || '';

    if (potentialAlias in aliases) {
        const relativePath: string = path.relative(file.dirname, aliases[potentialAlias]).replace(/\\/g, '/') || '.';
        const replacement: string = match.replace(potentialAlias, relativePath);

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

const absoluteAliases: Aliases = processAliasesToAbsolutePaths(project.paths);
export function processMarkupAliases(verbose = false): NodeJS.ReadWriteStream {
    return replace(/require from="(.*)"/g, function(match: string, requirePath: string): string {
        return processMarkupAlias({ aliases: absoluteAliases, file: this.file, match, requirePath, verbose });
    });
}
