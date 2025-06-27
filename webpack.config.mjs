import WebExtPlugin from 'web-ext-plugin';
import path from 'path';
import {fileURLToPath} from 'url';
import CopyPlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


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
    entry: {
        'strings-in-comments': './src/module/strings-in-comments/strings-in-comments-content-script.ts',
        'strings-in-comments-inject': './src/module/strings-in-comments/strings-in-comments-inject.ts',
        'show-full-file-name': './src/module/show-full-file-name/full-file-name-entrypoint.ts',
        'source-2-plural-gender': './src/module/source-2-plural-gender/source-2-plural-gender-entrypoint.ts',
    },
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
