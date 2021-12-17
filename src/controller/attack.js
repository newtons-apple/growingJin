const {monsterManager} = require('../datas/Manager');

const attack = async (req, res) => {
    const player = req.player;
    const monster = monsterManager.getMonster(player.state.enemy.id)

    return;
}

module.exports = {
    attack,
}
