import { AliasConfig, loadAliasConfigs } from "#src/alias-config";
import {
    AliasImportOptions,
    SupportedParserName,
    SupportedParsers,
} from "#src/options";
import generate from "@babel/generator";
import { parse, ParserOptions, ParserPlugin } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import { ImportDeclaration } from "@babel/types";
import { dirname, join, resolve } from "path";
import { AST } from "prettier";

const ParserPlugins: Record<SupportedParserName, ParserPlugin[]> = {
    [SupportedParsers.TypeScript]: [
        SupportedParsers.TypeScript,
        "jsx",
        "decorators-legacy",
        "classProperties",
    ],
    [SupportedParsers.Babel]: [],
    [SupportedParsers.Flow]: [SupportedParsers.Flow],
};

const getAst = (code: string, options: AliasImportOptions) => {
    const parserOptions: ParserOptions = {
        sourceType: "module",
        plugins: ParserPlugins[options.parser],
    };
    return parse(code, parserOptions);
};

const getImportNodes = (ast: AST) => {
    const importNodes: ImportDeclaration[] = [];
    traverse(ast, {
        ImportDeclaration: (path: NodePath<ImportDeclaration>) => {
            importNodes.push(path.node);
        },
    });
    return importNodes;
};

const rewriteImport = (
    node: ImportDeclaration,
    aliasConfigs: AliasConfig[],
    absoluteDir: string
): void => {
    if (node.source.value.trim().charAt(0) === ".") {
        rewriteRelativePath(node, aliasConfigs, absoluteDir);
    } else {
        const currentAlias = aliasConfigs.find(
            ({ alias }) => node.source.value.indexOf(alias) >= 0
        );
        if (currentAlias) {
            rewriteAliasedPath(node, aliasConfigs, currentAlias); // ensure highest rank
        }
    }
};

const getBestAlias = (aliasConfigs: AliasConfig[], filePath: string) =>
    aliasConfigs.find(
        ({ path: { absolute } }) => filePath.indexOf(absolute) >= 0
    );

const rewriteAliasedPath = (
    node: ImportDeclaration,
    aliasConfigs: AliasConfig[],
    currentAlias: AliasConfig
) => {
    const absModulePath = node.source.value.replace(
        currentAlias.alias,
        currentAlias.path.absolute
    );

    const bestAlias = getBestAlias(aliasConfigs, absModulePath);

    if (bestAlias && bestAlias !== currentAlias) {
        node.source.value = absModulePath.replace(
            bestAlias.path.absolute,
            bestAlias.alias
        );
    }
};

const rewriteRelativePath = (
    node: ImportDeclaration,
    aliasConfigs: AliasConfig[],
    absoluteDir: string
) => {
    const absModulePath = join(absoluteDir, node.source.value);
    const aliasConfig = getBestAlias(aliasConfigs, absModulePath);

    if (aliasConfig) {
        node.source.value = absModulePath.replace(
            aliasConfig.path.absolute,
            aliasConfig.alias
        );
    }
};

// Async plugins are dependent on resolution of
// https://github.com/prettier/prettier/issues/4459
export const preprocess = (
    code: string,
    options: AliasImportOptions
): string => {
    const ast = getAst(code, options);
    const importNodes = getImportNodes(ast);
    const aliasConfigs = loadAliasConfigs(options);

    if (!importNodes.length || !aliasConfigs.length) {
        return code; // avoid regeneration if no imports/aliases
    }

    const currentFileAbsDir = dirname(resolve(options.filepath));
    importNodes.forEach((node) =>
        rewriteImport(node, aliasConfigs, currentFileAbsDir)
    );

    // Babel does not guarantee any formatting,
    // so we avoid recompiling any of the actual code
    // and only replace the lines associated with imports.
    const originalCodeSplit = code.split("\n");
    const newImportLines = generate(ast, {
        retainLines: true,
    }).code.split(/\n/g);

    const endOfImports = importNodes.reduce(
        (last, node) => Math.max(node.end ?? last, last),
        0
    );
    // Get count of new lines from original code up to end of imports
    // Hopefully babel's `retainLines` keeps the correct number of lines here.
    const linesForImports =
        code.substring(0, endOfImports + 1).match(/\n/g)?.length ?? 0;

    originalCodeSplit.splice(
        0,
        linesForImports,
        ...newImportLines.slice(0, linesForImports)
    );

    return originalCodeSplit.join("\n");
};
