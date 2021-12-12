const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    id: String,
    password: String,
    player: { type: Schema.Types.ObjectId, ref: 'Player'},
});

const User = mongoose.model('User', userSchema);

module.exports = User;