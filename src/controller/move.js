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
            // Done : 확률별로 이벤트 발생하도록 변경
            const randomNum = Math.random()*100

            if(player.level!==1&&randomNum<10){
                const events = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../datas/events.json")))
                console.log(events)
              
                const event = events.filter((event,i)=>{
                  return player.level===(event.id+1)
                })[0]
              
                const log = `${event.name}\n큰 충격을 받았다. hp 절반이 줄어들었다.`
                player.HP = Math.ceil(player.HP/2)
                player.state = {status:1,log}
                await player.save()
                return res.json(player)
            }
            if (randomNum<30){
                const randomMent = ['다행이다','무료하다','훗'][Math.floor(Math.random()*3)] 
                const log = '아무일도 일어나지 않았다.'+randomMent
                player.state = {status:1,log}
                await player.save()
              return res.json(player)
            }
            if (randomNum>=30&&randomNum<70) {
              const monsterQuantity = [4,3,3,4]
              const level = player.level
              let id =0
              for(let i=0;i<4;i++){
                if(level<=i+1){
                  id+= Math.floor(Math.random()*monsterQuantity[player.level-1])
                  console.log(id+'ㅁ')
                  break;
                }
                id+=monsterQuantity[i]
                console.log(id)
              }

              console.log(id)
              const monster = monsterManager.getMonster(id)
              const log = `${monster.des}\n${monster.name}:"${monster.talk}"\n체력:${monster.hp} 공격력:${monster.str} 방어력: ${monster.def}`
    
              player.state = {status:2,enemy:{id:monster.id,reaminHp:monster.hp},log}
              await player.save()
              return res.json(player)
          }
          if(randomNum>=70){
              let id=0
              for(let i=0;i<4;i++){
                if(player.level<=i+1){
                  id+= Math.floor(Math.random()*3)
                  console.log(id+'ㅁ')
                  break;
                }
                id+=3
                console.log(id)
              }
              console.log(id)
              const item = itemManager.getItem(id)
              if(player.maxItemQuantity<=(player.items.reduce((p,c)=>p+c.quantity,0))){
                const log = `${item.name}을(를) 발견했으나 가방에 더는 들어가지 않아 가져갈 수 없었다...`
                player.state = {...player.state,log}
                await player.save()
                return res.json(player)
              }

              
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
                case '체력':
                  player.maxHp +=item.buff
                  player.HP += item.buff
                  break;
              }
              const log = `${item.name}을(를) 획득했다. ${item.type}이 ${item.buff}만큼 증가했다..!`
              player.state = {status:1,log}
              await player.save()
              return res.json(player)
          }

        
    }catch(e){
        console.error(e)
    }
        
return res.status(400).json({error:'something wrong'})
}

module.exports =move