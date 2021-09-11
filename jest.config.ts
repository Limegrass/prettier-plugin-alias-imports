import { Config } from "@jest/types";

const config: Config.InitialOptions = {
    testMatch: ["<rootDir>/**/__tests__/*.ts"],
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.(js|ts)$": "ts-jest",
    },
    moduleNameMapper: {
        "#root/(.*)": "<rootDir>/$1",
        "#src/(.*)": "<rootDir>/src/$1",
    },
    moduleFileExtensions: ["js", "ts"],
    globals: {
        "ts-jest": {
            isolatedModules: true,
            diagnostics: false,
        },
    },
};

// eslint-disable-next-line import/no-default-export
export default config;
