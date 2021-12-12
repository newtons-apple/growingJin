const mongoose = require('mongoose');

const User = require('./User');
const Item = require('./Item');
const Player = require('./Player');

const mongoURL = 'mongodb+srv://jahni:1234@cluster0.tbxh7.mongodb.net/testDB?retryWrites=true&w=majority'
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
    User,
    Item,
    Player,
}