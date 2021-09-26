import { log } from "#src/log";
import { AliasImportOptions } from "#src/options";
// Unsure how to best support find-up@^6.0.0 with the change to modules
// May depend on https://github.com/prettier/prettier/issues/8772
import { sync as findUpSync } from "find-up";
import micromatch from "micromatch";
import { dirname, join as joinPath } from "path";
import {
    ConfigLoaderResult,
    ConfigLoaderSuccessResult,
    loadConfig,
} from "tsconfig-paths";

/**
 * Failed loads result from invalid tsconfigs or tsconfigs without baseUrl.
 * Casts input into a ConfigLoaderSuccessResult result if valid.
 */
const isConfigLoaderSuccessResult = (
    configLoaderResult: ConfigLoaderResult
): configLoaderResult is ConfigLoaderSuccessResult =>
    configLoaderResult.resultType === "success";

export const loadAliasConfigs = (
    options: AliasImportOptions
): AliasConfig[] => {
    const configFilePath = findUpSync(
        [options.aliasConfigPath, "tsconfig.json", "jsconfig.json"].filter(
            Boolean
        ) as string[],
        {
            cwd: options.filepath, // works as dir
        }
    );

    if (!configFilePath) {
        log("cannot find ts/jsconfig, try assigning aliasConfigPath");
        return []; // Not sure if plugins should throw errors
    }

    const config = loadConfig(configFilePath);

    if (!isConfigLoaderSuccessResult(config)) {
        log("set compilerOptions.baseUrl and validate ts/jsconfig provided");
        return []; // Not sure if plugins should throw errors
    }

    const configDir = dirname(configFilePath);
    const absoluteRootDir = joinPath(configDir, config.baseUrl);

    return Object.entries(config.paths).reduce(
        (configs, [aliasGlob, aliasPaths]) => {
            aliasPaths.forEach((aliasPath) => {
                const relativePathBase = micromatch.scan(aliasPath).base;
                configs.push({
                    alias: micromatch.scan(aliasGlob).base,
                    path: {
                        absolute: joinPath(absoluteRootDir, relativePathBase),
                    },
                });
            });
            return configs;
        },
        [] as AliasConfig[]
    );
};

export interface AliasConfig {
    alias: string;
    path: {
        /** Glob values using absolute paths */
        absolute: string;
    };
}
