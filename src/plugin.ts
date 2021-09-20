import { options } from "#src/options";
import { preprocess } from "#src/preprocess";
import { Parser } from "prettier";
import { parsers as babelParsers } from "prettier/parser-babel";
import { parsers as flowParsers } from "prettier/parser-flow";
import { parsers as typescriptParsers } from "prettier/parser-typescript";

const parsers: Record<string, Parser> = {
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
