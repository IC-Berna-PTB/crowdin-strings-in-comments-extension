import WebExtPlugin from 'web-ext-plugin';
import path from 'path';
import {fileURLToPath} from 'url';
import CopyPlugin from "copy-webpack-plugin";
import * as fs from "node:fs";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

function checkScriptsForModule(moduleFolder, map) {
    if (!(moduleFolder instanceof fs.Dirent)) {
        return;
    }
    const files = fs.readdirSync(path.join(moduleFolder.parentPath, moduleFolder.name), {withFileTypes: true});
    const fileNames = files.map(f => f.name);
    if (fileNames.includes(`${moduleFolder.name}-content-script.ts`)) {
        map.set(moduleFolder.name, path.join(path.resolve(moduleFolder.parentPath), moduleFolder.name, `${moduleFolder.name}-content-script.ts`));
    }
    if (fileNames.includes(`${moduleFolder.name}-inject.ts`)) {
        map.set(`${moduleFolder.name}-inject`, path.join(path.resolve(moduleFolder.parentPath), moduleFolder.name, `${moduleFolder.name}-inject.ts`));
    }
    return map;
}

const map = new Map()

fs.readdirSync("./src/module", {recursive: false, withFileTypes: true})
    .filter(file => file.isDirectory())
    .map(file => checkScriptsForModule(file, map))


export default {
    plugins: [
        new CopyPlugin({
            patterns:
                [
                    {from: "src/manifest.json", to: "manifest.json"},
                    {from: "icon/128.png", to: "icon/128.png"},
                    {from: "resource", to: "resource"},
                ]
        }),
        new WebExtPlugin({
            buildPackage: true,
            sourceDir: path.resolve(__dirname, 'dist'),
            overwriteDest: true,
        })
        // new UserscriptPlugin({headers: {include: ["*://*.crowdin.com/editor/*", "*://crowdin.com/editor/*"], version: "1.3.0"}})
    ],
    entry: Object.fromEntries(map),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
};
