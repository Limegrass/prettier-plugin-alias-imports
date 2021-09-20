# prettier-plugin-alias-imports

A prettier plugin to rewrite import aliases from your alias configurations

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
            "#src/*": ["src/*"]
            "#root/*": ["*"],
        },
    }
}
```
