import { loadAliasConfigs } from "#src/alias-config";
import { AliasImportOptions, SupportedParsers } from "#src/options";
import { DEFAULT_OPTIONS } from "#src/__tests__/__mocks__/options";
import { sync as findUpSync } from "find-up";
import { loadConfig } from "tsconfig-paths";

jest.mock("tsconfig-paths");
jest.mock("find-up", () => ({
    sync: jest.fn(),
}));

const CURRENT_FILE_DIR = "src";
const TEST_OPTIONS = Object.freeze({
    ...DEFAULT_OPTIONS,
    filepath: `${CURRENT_FILE_DIR}/test.ts`,
    plugins: [],
});

describe.each([
    { parser: SupportedParsers.TypeScript },
    { parser: SupportedParsers.Babel },
])("loadAliases($parser)", ({ parser }) => {
    const options: AliasImportOptions = {
        ...TEST_OPTIONS,
        parser,
    };

    // Default happy path
    beforeEach(() => {
        const alias = "test";
        const pattern = "potato/*";
        const paths = {
            [alias]: [pattern],
        };
        (loadConfig as jest.Mock).mockReturnValue({
            resultType: "success",
            baseUrl: "/git/proj/tsconfig.json",
            paths,
        });
        (findUpSync as unknown as jest.Mock).mockReturnValue("tsconfig.json");
    });

    it("returns mapped alias and patterns for valid tsconfig", () => {
        const configs = loadAliasConfigs(options);
        expect(configs).toMatchSnapshot();
    });

    it("uses aliasConfigPath from options", () => {
        const customConfigPath = "potato.com";
        options.aliasConfigPath = customConfigPath;
        loadAliasConfigs(options);
        expect(findUpSync).toHaveBeenCalledWith(
            expect.arrayContaining([options.aliasConfigPath])
        );
    });

    it("returns an empty array if config path cannot be located", () => {
        const customConfigPath = "potato.com";
        options.aliasConfigPath = customConfigPath;
        (findUpSync as unknown as jest.Mock).mockReturnValue(undefined);
        const configs = loadAliasConfigs(options);
        expect(findUpSync).toMatchSnapshot();
        expect(configs).toHaveLength(0);
    });

    it("returns an empty array if the tsconfig has errors", () => {
        (loadConfig as jest.Mock).mockReturnValue({
            resultType: "failed",
        });
        const configs = loadAliasConfigs(options);
        expect(findUpSync).toMatchSnapshot();
        expect(configs).toHaveLength(0);
    });
});
