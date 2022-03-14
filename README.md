# prettier-plugin-alias-imports

A prettier plugin to rewrite import aliases from your alias configurations.

Although this plugin does work, you should really use an eslint rule instead.

See [eslint-import-alias](https://github.com/steelsojka/eslint-import-alias) as the alternative.

## Why

-   Automatic imports by tsserver resolve to relative paths that can be normalized.
-   It's easier to refactor by finding and replacing an absolute module path
    without worrying about crafting the regex for `../` and `./`

## Requirements

-   Node 14+

## Install

```shell
npm install --save-dev prettier-plugin-alias-imports
```

## Configuration

Ensure you have your paths specified in your `tsconfig.json` (or `jsconfig.json`).
You can specify a config path one with `aliasConfigPath` in your prettier config.
The aliases should be ordered from most preferred to least.

For example, the #src import will be preferred with the following configuration.

```jsonc
{
    // ...other options
    "compilerOptions": {
        "baseUrl": ".", // required
        "paths": {
            "#src/*": ["src/*"],
            "#root/*": ["*"]
        }
    }
}
```

## Troubleshooting

#### Compatibility with other plugins

Explicitly assign this plugin as the last plugin in your configuration list.

This plugin runs prettier using every available plugin, so specifying it last
guarantees that the result of this plugin will be resulting formatted code,
which is the result of calling prettier with every plugin individually.

```jsonc
// prettier configuration
{
    // ...other prettier options
    "plugins": [
        // ...other prettier plugins
        "./node_modules/prettier-plugin-alias-imports"
    ]
}
```

## Disclaimer

The way this (and most other plugins that aren't adding new language support) functions
uses prettier APIs in a way that is not truly intended. The prettier team seems to consider
these type of plugins experimental, so I can only somewhat guarantee usability for
the version specified in package-lock.json (from dev dependencies, 2.4.0 at the time of writing).

Also note that your editor performance may slightly suffer as it will technically
run all other plugins except this one twice due to the implementation for compatibility
with other plugins as mentioned in the [compatibility section](#compatibility-with-other-plugins)
