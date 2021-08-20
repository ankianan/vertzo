const path = require('path');

module.exports = {
    entry: './src/main/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
    },
    mode: "development",
    watch: true
};
