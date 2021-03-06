const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    name: String,
    key: String,

    level: {type: Number, default: 1},

    exp: {type: Number, default: 0},
    maxHp: {type: Number, default: 100},
    HP: {type: Number, default: 100},

    str: {type: Number, default: 18 + Math.floor(Math.random()*5)},
    def: {type: Number, default: 3 + Math.floor(Math.random()*5)},

    reroll: {type: Number, default: 5},

    x: {type: Number, default: 0},
    y: {type: Number, default: 0},
    turn: {type: Number, default: 0},
    maxItemQuantity: {type: Number, default: 5},
    mapDesc: {type: String, default: "새로운 삶의 시작이다."},
    state: {status: Number, enemy: {id: Number, remainHp: Number}, log: String},
    //status : start:0, normal:1, encounter:2,battle:3
    items: [{name:String, quantity:Number}],
    maxItemQuantity:{type:Number, default:5},
    auto: {type: Boolean, default: false},

    user: {type: Schema.Types.ObjectId, ref: 'User'},
});

schema.methods.incrementHP = function (hp) {
    const _hp = this.HP + hp;
    this.HP = Math.min(_hp, this.maxHp);
};

const Player = mongoose.model("Player", schema);

module.exports = Player;
