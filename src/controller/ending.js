const {Item,Player,User} = require('../models')

const ending = async (req, res) => {
    const player = req.player;
    while (player.level === 4) {
        if (player.exp >= 60) {
            //유니콘
        } else if (player.exp >= 50) {
            //실버타운
        } else if (player.exp > 40) {
            //과로사 (사망은 좀 무례하다면.. 응급실행..?)
            
        }
    }

}

module.exports = {
    ending
}