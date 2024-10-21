import WebExtPlugin from 'web-ext-plugin';
import path from 'path';
import {fileURLToPath} from 'url';
import CopyPlugin from "copy-webpack-plugin";
import {UserscriptPlugin} from "webpack-userscript";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


export default {
    plugins: [
        new CopyPlugin({
            patterns:
                [
                    {from: "src/manifest.json", to: "manifest.json"},
                    {from: "icon/128.png", to: "icon/128.png"},
                ]
        }),
        new WebExtPlugin({
            buildPackage: true,
            sourceDir: path.resolve(__dirname, 'dist'),
            overwriteDest: true,
        })
        // new UserscriptPlugin({headers: {include: ["*://*.crowdin.com/editor/*", "*://crowdin.com/editor/*"], version: "1.3.0"}})
    ],
    entry: './src/entrypoint.ts',
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
        filename: 'entrypoint.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
