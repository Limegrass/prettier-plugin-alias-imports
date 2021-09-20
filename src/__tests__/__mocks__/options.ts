import { ParserOptions } from "prettier";

export const DEFAULT_OPTIONS: Omit<
    ParserOptions,
    "parser" | "filepath" | "plugins"
> = {
    originalText: "123",
    locStart: jest.fn().mockReturnValue(0),
    locEnd: jest.fn().mockReturnValue(100),
    arrowParens: "always",
    bracketSpacing: true,
    embeddedLanguageFormatting: "auto",
    endOfLine: "lf",
    htmlWhitespaceSensitivity: "css",
    insertPragma: false,
    jsxBracketSameLine: false,
    jsxSingleQuote: false,
    printWidth: 80,
    proseWrap: "preserve",
    quoteProps: "as-needed",
    rangeEnd: Infinity,
    rangeStart: 0,
    requirePragma: false,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
    useTabs: false,
    vueIndentScriptAndStyle: false,
};
