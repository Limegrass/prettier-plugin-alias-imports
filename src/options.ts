import { ParserOptions, SupportOption } from "prettier";

export const SupportedParsers = {
    TypeScript: "typescript",
    Babel: "babel",
    Flow: "flow",
} as const;

/** Type for the values of `SupportedParsers`. */
export type SupportedParserName =
    typeof SupportedParsers[keyof typeof SupportedParsers];

export interface AliasImportOptions extends ParserOptions {
    aliasConfigPath?: string;
    parser: SupportedParserName;
}

/**
 * Force `options` to only include keys from the AliasImportOptions interface
 */
type AliasImportSupportOptions = Omit<
    Record<keyof AliasImportOptions, SupportOption>,
    keyof ParserOptions
>;

/**
 * Configuration options specific to this plugin
 * which prettier presents to the user if installed.
 */
export const options: AliasImportSupportOptions = {
    // Would be nice to be able to use some type
    // type ConfigFile = { path: string; type: SupportedParserPlugins }
    // but I don't think that is supported
    aliasConfigPath: {
        since: "0.1.0",
        type: "path", // string is supported by prettier but the types needs to be updated
        category: "Global",
        description: "Configuration file to read. Defaults to tsconfig.json",
    },
};
