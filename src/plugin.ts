import { AliasImportOptions, options, SupportedParserName } from "#src/options";
import { preprocess as preprocessAliases } from "#src/preprocess";
import { Parser } from "prettier";
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
    const preprocessedCode = options.plugins.reduce((wipCode, plugin) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsers = (plugin as any).parsers;
        const parser = parsers[options.parser];
        if (parser?.preprocess) {
            return parser.preprocess(wipCode, options);
        } else {
            return wipCode;
        }
    }, preprocessAliases(code, options));
    hasProcessed = false;
    return preprocessedCode;
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
