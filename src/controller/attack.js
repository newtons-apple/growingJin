const {monsterManager, mapManager} = require('../datas/Manager');
const startPlace = {1: [0, 0], 2: [1, 0], 3: [3, 0], 4: [6, 0]};

const attack = async (req, res) => {
    const player = req.player;
    let probability = 0; // 무작위 확률로 공격 성공 or 실패
    let damage = 0; // 공격 주고 받는 데미지 -> 각각의 방어력에서 공격력을 뺀 값
    const MAX_EXP = 100;
    const monster = monsterManager.getMonster(player.state.enemy.id) // monster 정보
    player.state.status = 3;

    if (player.HP < Math.floor(player.maxHp * 0.2) || player.turn >= 10) {
        if (player.turn === 0) {
            player.state.log = "";
        }
        probability = Math.random();
        player.turn++;
        if (probability > 0.5) {
            damage = player.str - monster.def + Math.floor(Math.random() * 3);
            damage = Math.max(0, damage);
            player.state.enemy.remainHp -= damage;
            player.state.log += `공격을 성공했습니다. ${damage}의 피해를 입혔습니다.\n적의 남은 체력 : ${Math.max(0, player.state.enemy.remainHp)} / ${monster.hp}\n`;
            if (player.state.enemy.remainHp <= 0) {
                player.state.log += '적을 무찔렀습니다!!!\n 체력의 5%를 회복했습니다.\n';
                player.incrementHP(Math.floor(player.maxHp * 0.05));  // 남은 체력의 5% 회복
                player.exp += monster.exp;  // 경험치 획득
                player.turn = 0; // 전투 종료 후 turn 리셋
                player.state.status = 1; // status : normal
                if (player.level < 4 && MAX_EXP <= player.exp) {
                    player.level += 1;  // 레벨업
                    player.exp = 0;
                    player.HP = player.maxHp;  // 체력 회복
                    player.maxItemQuantity += 5; // 인벤토리 증가
                    player.state.log += '레벨업하였습니다.\n 체력을 회복했습니다.\n 다음 스테이지로 이동합니다.\n';
                    player.x = startPlace[player.level][0];
                    player.y = startPlace[player.level][1];
                    mapInfo(player);
                }
            }
            await player.save();
            player.auto = false;
            return res.json(player);
        } else {
            damage = monster.str - player.def + Math.floor(Math.random() * 3);
            damage = Math.max(0, damage);

            player.HP -= damage;
            player.state.log += `공격을 실패했습니다. ${damage}의 피해를 입었습니다.\n적의 남은 체력 : ${Math.max(0, player.state.enemy.remainHp)} / ${monster.hp}\n`;
            if (player.HP <= 0) {
                player.state.status = 1; // 전투 종료
                if (player.items.length === 0) {
                    player.state.log += '죽었습니다...\n 스테이지의 처음으로 돌아갑니다.';
                } else {
                    const random = Math.floor(Math.random() * player.items.length); // 삭제 아이템 랜덤 인덱스
                    if (player.items[random].quantity === 1) {
                        player.items.splice(random, 1);
                    } else {
                        player.items[random].quantity--;
                    }
                    player.state.log += '죽었습니다...\n 아이템을 잃었습니다.\n 스테이지의 처음으로 돌아갑니다.';
                }
                player.HP = Math.floor(player.maxHp / 2);   // maxHP 절반의 체력으로 초기화
                player.turn = 0; // 전투 종료 후 turn 리셋
                player.x = startPlace[player.level][0];
                player.y = startPlace[player.level][1];
                mapInfo(player);
            }
            await player.save();
            player.auto = false;
            return res.json(player);
        }
    }
    // 자동 공격 이후 공격 누른 경우

    player.state.log = "";
    while (player.HP >= Math.floor(player.maxHp * 0.2) && player.turn < 10) {
        probability = Math.random();
        player.turn++;
        if (probability > 0.5) {
            damage = player.str - monster.def + Math.floor(Math.random() * 3);
            damage = Math.max(0, damage);
            player.state.enemy.remainHp -= damage;
            player.state.log += `공격에 성공했습니다. ${damage}의 피해를 입혔습니다.\n적의 남은 체력 : ${Math.max(0, player.state.enemy.remainHp)} / ${monster.hp}\n`;
            if (player.state.enemy.remainHp <= 0) {
                player.state.log += '적을 무찔렀습니다!!!\n 체력의 5%를 회복했습니다.\n';
                player.incrementHP(Math.floor(player.maxHp * 0.05));  // 남은 체력의 5% 회복
                player.exp += monster.exp;  // 경험치 획득
                player.turn = 0; // 전투 종료 후 turn 리셋
                player.state.status = 1; // status : normal
                if (player.level < 4 && MAX_EXP <= player.exp) {
                    player.level += 1;  // 레벨업
                    player.exp = 0;
                    player.HP = player.maxHp;  // 체력 회복
                    player.maxItemQuantity += 5; // 인벤토리 증가
                    player.state.log += '레벨업하였습니다.\n 체력을 회복했습니다.\n 다음 스테이지로 이동합니다.\n';
                    player.x = startPlace[player.level][0];
                    player.y = startPlace[player.level][1];
                    mapInfo(player);
                }
                break;
            }
        } else {
            damage = monster.str - player.def + Math.floor(Math.random() * 3);
            damage = Math.max(0, damage);
            player.HP -= damage;
            player.state.log += `공격을 실패했습니다. ${damage}의 피해를 입었습니다.\n적의 남은 체력 : ${Math.max(0, player.state.enemy.remainHp)} / ${monster.hp}\n`;
            if (player.HP <= 0) {
                player.state.log += '치명상을 입었습니다.\n 죽기 일보 직전입니다.\n';
                player.HP = Math.floor(player.maxHp * 0.01)
                break;
            }
        }
    }
    await player.save();
    player.auto = true;
    return res.json(player);
}
// 자동 공격

const mapInfo = (player) => {
    const field = mapManager.getField(player.x,player.y);
    player.mapDesc = field.description;
}

module.exports = attack;
