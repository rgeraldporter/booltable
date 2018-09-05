const path = require('path');

module.exports = {
    entry: {
        'booltable.min': './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'bundles'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'BoolTable',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                query: {
                    declaration: false
                }
            }
        ]
    }
};
