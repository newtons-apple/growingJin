const {Item,Player,User} = require('../models')


const reset = async (req, res) => {
    const player = req.player;
    if (player.state.status === 0) {

        player.str = 18 + Math.floor(Math.random()*5);
        player.def = 3 + Math.floor(Math.random()*5);

        player.reroll -= 1;
        player.state.log = `능력치 리셋 완료. 남은 리셋 횟수: ${player.reroll}`;

        if (player.reroll === 0) {
            player.state.status = 1
        }
    
    await player.save();
    return res.send(player);

    }

}

module.exports = {
    reset
}