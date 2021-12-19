const {Item,Player,User} = require('../models')
const {monsterManager, mapManager, itemManager} = require('../datas/Manager');

const run = async (req, res) => {
    const player = req.player;
    const monster = monsterManager.getMonster(player.state.enemy.id)
    const log = `후.. ${monster.name}으로부터 도망쳤다`
        //status : normal로 변경
    player.state = {status:1,log}
    
    await player.save();
    return res.send(player);
}

module.exports = run
