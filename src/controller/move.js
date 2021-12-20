/**
 * @author g1
 * @param
 */
 const {monsterManager, mapManager, itemManager} = require('../datas/Manager');
const {Item,Player,User} = require('../models')
const path = require('path')
const fs = require('fs')

const move = async (req,res)=>{
    const player = req.player;
    const direction = parseInt(req.body.direction, 0); // 0 동. 1 서 . 2 남. 3 북.
    let x = player.x; //x는 +북,-남 방향
    let y = player.y; //y는 +동,-서 방향
    try{
        if(!player.state.status){
          player.state.status=1
        }
        let canGo = mapManager.getField(x,y).canGo
        if(!canGo[direction]){
            player.state.log = '이동하지 못했다. 보이지 않는 벽이 나를 막은 듯 하다. 다른 길로 가볼까?'
            console.log('cantgo')
            await player.save()
            return res.json(player)
        }
        if (direction === 0) {
          y += 1;
        } else if (direction === 1) {
          y -= 1;
        } else if (direction === 2) {
          x -= 1;
        } else if (direction === 3) {
          x += 1;
        } else {
          res.sendStatus(400);
        }

        const field = mapManager.getField(x, y);
        if (!field) res.sendStatus(400);
        player.x = x;
        player.y = y;
        player.mapDesc = field.description;
        const events = field.events;
        if(events.length > 0) {
            // Done : 확률별로 이벤트 발생하도록 변경
            const randomNum = Math.random()*100
            const _event = events.reduce((p,c)=>{
                if(typeof p ==='object'){
                    return p
                }
                if((p+c.percent)>randomNum){
                    return c
                }else{
                    p+=c.percent
                    return p
                }
            },0)
            if(player.level!==1&&randomNum<20){
                const events = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../datas/events.json")))
                console.log(events)

                const event = events.filter((event,i)=>{
                  console.log(event.id +1)
                  console.log(player.level)
                  return player.level===(event.id+1)
                })[0]

                console.log(event)
                const log = `${event.name}\n큰 충격을 받았다. hp 절반이 줄어들었다.`
                player.Hp = Math.floor(player.Hp/2)
                player.state = {status:1,log}
                await player.save()
                return res.json(player)
            }
            if (typeof _event ==='number'){
                const randomMent = ['다행이다','무료하다','훗'][Math.floor(Math.random()*3)]
                const log = '아무일도 일어나지 않았다.'+randomMent
                player.state = {status:1,log}
                await player.save()
              return res.json(player)
            }
            if (_event.type === "battle") {
              // TODO: 이벤트 별로 events.json 에서 불러와 이벤트 처리
              //enemy.remainHp 입력
              const monster = monsterManager.getMonster(_event.monster)
              const log = `${monster.des}\n${monster.name}:"${monster.talk}"`

              player.state = {status:2,enemy:{id:monster.id,remainHp:monster.hp},log}
              await player.save()
              return res.json(player)
          }
          if(_event.type==='item'){
              const item = itemManager.getItem(_event.item)
              if(player.items.length===0){
                player.items = [{name:item.name,quantity:1}]
              }else{
              let alreadyhaveIndex = player.items.map(myItem=>myItem.name).indexOf(item.name)
              if(alreadyhaveIndex>=0){
                player.items[alreadyhaveIndex].quantity++
              }else{
                player.items = [...player.items, {name:item.name,quantity:1}]
              }
              }
              switch(item.type){
                case '방어력':
                  player.def +=item.buff
                  break;
                case '공격력':
                  player.str +=item.buff
                  break;
              }
              const log = `${item.name}을(를) 획득했다. ${item.type}이 ${item.buff}만큼 증가했다..!`
              player.state = {status:1,log}
              await player.save()
              return res.json(player)
          }

        }
    }catch(e){
        console.error(e)
    }

return res.status(400).json({error:'something wrong'})
}

module.exports =move
