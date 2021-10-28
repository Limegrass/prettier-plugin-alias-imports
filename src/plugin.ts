import { AliasImportOptions, options, SupportedParserName } from "#src/options";
import { preprocess as preprocessAliases } from "#src/preprocess";
import { format, Parser } from "prettier";
import { parsers as babelParsers } from "prettier/parser-babel";
import { parsers as flowParsers } from "prettier/parser-flow";
import { parsers as typescriptParsers } from "prettier/parser-typescript";

// avoid recursive invocations
let hasProcessed = false;

/**
 * Hack in support for other preprocessors
 * by running all of them that has an entry for the current parser
 */
const preprocess = (code: string, options: AliasImportOptions): string => {
    if (hasProcessed) return code;
    hasProcessed = true;
    try {
        return options.plugins.reduce(
            (wipCode: string, plugin) =>
                format(wipCode, {
                    ...options,
                    plugins: [plugin],
                }),
            preprocessAliases(code, options)
        ) as string;
    } finally {
        hasProcessed = false; // allows reformatting again for language servers
    }
};

const parsers: Record<SupportedParserName, Parser> = {
    babel: {
        ...babelParsers.babel,
        preprocess,
    },
    flow: {
        ...flowParsers.flow,
        preprocess,
    },
    typescript: {
        ...typescriptParsers.typescript,
        preprocess,
    },
};

const plugin = {
    parsers,
    options,
};

export = plugin;
