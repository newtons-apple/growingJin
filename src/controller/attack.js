const {monsterManager} = require('../datas/Manager');

const attack = async (req, res) => {
    const player = req.player;
    player.state.status = 3;
    player.state.log = ""; // 공격과 피해 상태 저장
    let probability = 0; // 무작위 확률로 공격 성공 or 실패
    let damage = 0; // 공격 주고 받는 데미지 -> 각각의 방어력에서 공격력을 뺀 값
    const monster = monsterManager.getMonster(player.state.enemy.id) // monster 정보

    if (player.HP < Math.floor(player.maxHp * 0.2) || player.state.turn >= 10) {
        probability = Math.random();
        player.turn++;
        if (probability > 0.5) {
            damage = player.str - monster.def + Math.floor(Math.random() * 3);
            if (Math.sign(damage) === -1) {
                damage = 0;
            }
            player.state.enemy.remainHp -= damage;
            player.state.log = `공격을 성공했습니다. ${damage}의 피해를 입혔습니다.\n`;
            if (player.state.enemy.remainHp <= 0) {
                player.state.log += '적을 무찔렀습니다!!!\n 남은 체력을 5%를 회복했습니다.\n';
                player.HP += Math.floor(player.maxHp * 0.05);  // 남은 체력의 5% 회복
                player.exp += monster.exp;  // 경험치 획득
                player.turn = 0; // 전투 종료 후 turn 리셋
                player.state.status = 1; // status : normal
                if (player.level * 10 < player.exp) {
                    player.level += 1;  // 레벨업
                    player.HP = player.maxHp;  // 체력 회복
                    player.state.log += '레벨업하였습니다.\n 체력을 회복했습니다.\n 다음 스테이지로 이동합니다.\n'
                    if (player.level === 2) {
                        player.x = 1;
                        player.y = 0;
                    } else if (player.level === 3) {
                        player.x = 3;
                        player.y = 0;
                    } else if (player.level === 4) {
                        player.x = 6;
                        player.y = 0;
                    }
                    await player.save();
                    player.auto = false;
                    return res.send(player);
                }
                await player.save();
                player.auto = false;
                return res.send(player);
            }
            await player.save();
            player.auto = false;
            return res.send(player);
        } else {
            damage = monster.str - player.def + Math.floor(Math.random() * 3);
            if (Math.sign(damage) === -1) {
                damage = 0;
            }
            player.HP -= damage;
            player.state.log = `공격을 실패했습니다.. ${damage}의 피해를 입었습니다.\n`;
            if (player.HP <= 0) {
                // player.state.log += '죽었습니다...\n 아이템을 잃었습니다.\n 스테이지의 처음으로 돌아갑니다.';
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
                if (player.level === 1) {
                    player.x = 0;
                    player.y = 0;
                } else if (player.level === 2) {
                    player.x = 1;
                    player.y = 0;
                } else if (player.level === 3) {
                    player.x = 3;
                    player.y = 0;
                } else if (player.level === 4) {
                    player.x = 6;
                    player.y = 0;
                }
                // 사망한 후 각 레벨에 따른 좌표 초기화
                await player.save();
                player.auto = true;
                return res.send(player);
            }
            await player.save();
            player.auto = true;
            return res.send(player);
        }
    }
    // 자동 공격 이후 공격 누른 경우

    while (player.HP >= Math.floor(player.maxHp * 0.2) && player.state.turn < 10) {
        probability = Math.random();
        player.state.turn++;
        if (probability > 0.5) {
            damage = player.str - monster.def + Math.floor(Math.random() * 3);
            player.state.enemy.remainHp -= damage;
            player.state.log += `공격에 성공했다. ${damage}의 피해를 입혔다.\n`;
            if (player.state.enemy.remainHp <= 0) {
                player.state.log += '적을 무찔렀다!!!\n 남은 체력을 5%를 회복했다.\n';
                player.HP += player.HP * 0.05;  // 남은 체력의 5% 회복
                player.isFighting = false; // 전투 종료
                player.exp += monster.exp;  // 경험치 획득
                if (player.level * 10 < player.exp) {
                    player.level += 1;  // 레벨업
                    player.state.log += '레벨업하였습니다. \n 다음 스테이지로 이동합니다.\n'
                    if (player.level === 1) {
                        player.x = 0;
                        player.y = 0;
                        // 삭제
                    } else if (player.level === 2) {
                        player.x = 1;
                        player.y = 0;
                    } else if (player.level === 3) {
                        player.x = 3;
                        player.y = 0;
                    } else if (player.level === 4) {
                        player.x = 6;
                        player.y = 0;
                    }
                }
                player.state.turn = 0; // 전투 종료 후 turn 리셋
                // level = {1, 2, 3, 4} => maxExp = {10, 20, 30, 40}
            }
        } else {
            damage = monster.str - player.def;
            player.HP -= damage;
            player.state.log += `공격에 실패했다. ${damage}의 피해를 입었다.\n`;
            player.state
        }
        // TODO: hp 체크 -> 음수일 경우 체력을 1%을 남기게 한 후 log 저장
    }
    // 자동 공격 로직
    await player.save();
    return res.send(player);
}

module.exports = attack;
