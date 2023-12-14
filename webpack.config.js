const path = require('path');

module.exports = {
    entry: './juggrefview/scripts/index.js',
    output: {
        'path': path.resolve(__dirname, 'static'),
        'filename': 'bundle_jugrefview.js'
    },
    resolve: {
        extensions: ['.ts', '...'],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.ts$/i,
                use: 'ts-loader',
                exclude: '/node_modules/'
            }
        ]
    }
}

