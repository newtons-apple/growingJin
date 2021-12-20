const {Item,Player,User} = require('../models')

const ending = async (req, res) => {
    const player = req.player;
    while (player.level === 4) {
        if (player.exp >= 60) {
            //유니콘 -> ending1
            res.send();

        } else if (player.exp >= 50) {
            //실버타운 -> ending2

        } else if (player.exp > 40) {
            //과로사 -> ending3

        }
    }

}

module.exports = ending