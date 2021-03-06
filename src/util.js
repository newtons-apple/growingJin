const crypto = require('crypto');

const encryptPassword = (password) => {
    return crypto.createHash('sha512').update(password).digest('base64');
}

module.exports = {
    encryptPassword,
}