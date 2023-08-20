const path = require('path');

module.exports = {
    mode: 'development',
    devtool: false,
    entry: "./public/assets/js/src/app.ts",
    output: {
        path: path.resolve(__dirname, 'public/assets/js/dist'),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [{
            test: /\.ts?$/,
            exclude: /node_modules/,
            use: {
                loader: 'ts-loader'
            }
        }]
    },
    resolve: {
        extensions: ['.ts']
    },
    watch: true,
    watchOptions: {
        ignored: /node_modules/
    },
    cache: false
}