import aliasPlugin from "#src/plugin";
import { parsers as babelParsers } from "prettier/parser-babel";
import { parsers as flowParsers } from "prettier/parser-flow";
import { parsers as typescriptParsers } from "prettier/parser-typescript";
import { format } from "prettier";
import { SupportedParsers } from "#src/options";

const code = `
    import { write } from "fs";
    import { potato } from "./potato";
`;

const fakeCodeAddition = "// potato";
const fakePreprocess = (code: string) => code + fakeCodeAddition;

describe("prettier-plugin-alias-imports", () => {
    it.each([
        {
            parserName: SupportedParsers.Babel,
            fileExtension: "js",

            parser: babelParsers.babel,
        },
        {
            parserName: SupportedParsers.Flow,
            fileExtension: "js",
            parser: flowParsers.flow,
        },
        {
            parserName: SupportedParsers.TypeScript,
            fileExtension: "ts",
            parser: typescriptParsers.typescript,
        },
    ])(
        "formats with other $parserName plugins",
        ({ parserName, parser, fileExtension }) => {
            const formattedCode = format(code, {
                filepath: `./src/plugin.${fileExtension}`,
                parser: parserName,
                plugins: [
                    {
                        parsers: {
                            [parserName]: {
                                ...parser,
                                preprocess: fakePreprocess,
                            },
                        },
                    },
                    aliasPlugin, // should be last
                ],
            });
            expect(formattedCode).toMatch(fakeCodeAddition);
            expect(formattedCode).toMatch(`#src/potato`);
            expect(formattedCode).toMatchSnapshot(); // purely for inspection
        }
    );
});
