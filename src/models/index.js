const mongoose = require('mongoose');
const { mongoURL } = require('../secret'); // src 폴더 바로 아래 secret.js를 만들고 mongoURL을 export 해주세요!

const User = require('./User');
const Item = require('./Item');
const Player = require('./Player');

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
    User,
    Item,
    Player,
}