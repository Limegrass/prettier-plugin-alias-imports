import { loadAliasConfigs } from "#src/alias-config";
import { SupportedParsers } from "#src/options";
import { preprocess } from "#src/preprocess";
import { DEFAULT_OPTIONS } from "#src/__tests__/__mocks__/options";

jest.mock("#src/alias-config");
jest.mock("path", () => ({
    ...jest.requireActual("path"),
    // Match CURRENT_FILE_DIR, but can't ref in jest.mock
    dirname: jest.fn().mockReturnValue("/x/y/src"),
}));

const SRC_FILE_DIR = "/x/y/src";
const SUBDIRECTORY_IDENTIFIER = `sub`;
const DIRECT_IMPORT_IDENTIFIER = `that-one-thing`;

const SRC_ALIAS_CONFIG = {
    alias: `#src`,
    path: {
        absolute: SRC_FILE_DIR,
    },
};

const SUBDIRECTORY_ALIAS_CONFIG = {
    alias: `#sub`,
    path: {
        absolute: `${SRC_FILE_DIR}/${SUBDIRECTORY_IDENTIFIER}`,
    },
};

// Non-globbed
const directAliasConfig = {
    alias: `#that-one-thing`,
    path: {
        absolute: `${SRC_FILE_DIR}/${DIRECT_IMPORT_IDENTIFIER}`,
    },
};

const RELATIVE_IMPORT = 'import { Much } from "./Wow";';
const SUBDIRECTORY_ALIAS_IMPORT = `import { Trash } from "#${SRC_ALIAS_CONFIG.alias}/${SUBDIRECTORY_IDENTIFIER}/garbage";`;
const DIRECT_ALIAS_IMPORT = `import "${SRC_ALIAS_CONFIG.alias}/${DIRECT_IMPORT_IDENTIFIER}"`;
const MODULE_IMPORT = 'import path from "path";';
const LINE_COMMENT = "// POTATO";
const BLOCK_COMMENT = "/* ROCK */";
const DOC_COMMENT = "/** CHOCOLATE */";
const BODY = 'console.log("potato");';

const CODE = `
${LINE_COMMENT}
${RELATIVE_IMPORT}
${SUBDIRECTORY_ALIAS_IMPORT}
${DIRECT_ALIAS_IMPORT}
${BLOCK_COMMENT}
${MODULE_IMPORT}

${DOC_COMMENT}
${BODY}
`;

describe("preprocess", () => {
    const options = {
        ...DEFAULT_OPTIONS,
        filepath: `${SRC_FILE_DIR}/test.ts`,
        parser: SupportedParsers.TypeScript,
        plugins: [],
    };

    beforeEach(() => {
        (loadAliasConfigs as jest.Mock).mockReturnValue([
            directAliasConfig,
            SUBDIRECTORY_ALIAS_CONFIG,
            SRC_ALIAS_CONFIG,
        ]);
    });

    it("rewrites relative imports with alias", () => {
        const processedCode = preprocess(CODE, options);
        expect(processedCode).toContain(
            RELATIVE_IMPORT.replace(".", SRC_ALIAS_CONFIG.alias)
        );
    });

    it("rewrites a lower priority alias", () => {
        const processedCode = preprocess(CODE, options);
        expect(processedCode).toContain(SUBDIRECTORY_ALIAS_CONFIG.alias);
    });

    it("rewrites non-glob alias", () => {
        const processedCode = preprocess(CODE, options);
        expect(processedCode).toContain(directAliasConfig.alias);
    });

    it("does not modify the whitespace in the file", () => {
        const processedCode = preprocess(CODE, options);
        const whiteSpaceCount = processedCode.match(/\s/)?.length;
        expect(whiteSpaceCount).not.toBeNull();
        expect(whiteSpaceCount).toEqual(CODE.match(/\s/)?.length);
    });

    it("does not affect module imports", () => {
        const processedCode = preprocess(CODE, options);
        expect(processedCode).toContain(MODULE_IMPORT);
    });

    it("returns same code if no imports", () => {
        const importlessCode = 'console.log("aaaa")';
        const processedCode = preprocess(importlessCode, options);
        expect(processedCode).toBe(importlessCode);
    });

    it("returns same code if no config", () => {
        (loadAliasConfigs as jest.Mock).mockReturnValue([]);
        const processedCode = preprocess(CODE, options);
        expect(processedCode).toBe(CODE);
    });

    it("does not affect the code body", () => {
        const processedCode = preprocess(CODE, options);
        expect(processedCode.indexOf(BODY)).toBeGreaterThanOrEqual(0);
    });
});
