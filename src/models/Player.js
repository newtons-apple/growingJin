const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    name: String,
    key: String,

    level: {type: Number, default: 1},

    exp: {type: Number, default: 0},
    maxHp: {type: Number, default: 100},
    HP: {type: Number, default: 100},
    str: {type: Number, default: 20},
    def: {type: Number, default: 5},
    x: {type: Number, default: 0},
    y: {type: Number, default: 0},

    state: {isFighting: Boolean, enemy: {id: Number, remainHp: Number}, log: String},
    items: [String],

    user: {type: Schema.Types.ObjectId, ref: 'User'},
});

schema.methods.incrementHP = function (hp) {
    const _hp = this.HP + hp;
    this.HP = Math.min(Math.max(0, hp), this.maxHP);
};

const Player = mongoose.model("Player", schema);

module.exports = Player;
