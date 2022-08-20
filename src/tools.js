const path = require('path');

module.exports = {
    dirname_path: function (directory) {
        return path.join(__dirname, directory);
    }
}