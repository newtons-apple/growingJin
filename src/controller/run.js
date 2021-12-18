const {Item,Player,User} = require('../models')


const run = async (req, res) => {
    if (player.state.turn >= 10 || player.HP < player.maxHp * 0.2) {
        //status : normal로 변경
        player.state.status = 1
    }
    await player.save();
    return res.send(player);
}