const fs = require("fs");

class Manager {
  constructor() {}
}

class ConstantManager extends Manager {
  constructor(datas) {
    super();
    this.gameName = datas.gameName;
  }
}

class MapManager extends Manager {
  constructor(datas) {
    super();
    this.id = datas.id;
    this.fields = {};

    datas.fields.forEach((field) => {
      this.fields[`${field[0]}_${field[1]}`] = {
        x: field[0],
        y: field[1],
        description: field[2],
        canGo: field[3],
        events: field[4]
      };
    });
  }

  getField(x, y) {
    return this.fields[`${x}_${y}`];
  }
}

class MonsterManager extends Manager {
  constructor(datas) {
    super();
    this.monsters = {};

    datas.forEach((monster) => {
      this.monsters[`${monster.id}`] = {
        id: monster.id,
        name: monster.name,
        talk: monster.talk,
        des: monster.des,
        str: monster.str,
        def: monster.def,
        hp: monster.hp,
        exp: monster.exp,
      };
    });
  }
  getMonster(id) {
    return this.monsters[`${id}`];
  }
}

class ItemManager extends Manager {
  constructor(datas) {
    super();
    this.items = {};

    datas.forEach((item) => {
      this.items[`${item.id}`] = {
        id: item.id,
        name: item.name,
        type: item.type,
        buff: item.buff,
      };
    });
  }
  getItem(id) {
    return this.items[`${id}`];
  }
}

const constantManager = new ConstantManager(
  JSON.parse(fs.readFileSync(__dirname + "/constants.json"))
);

const mapManager = new MapManager(
  JSON.parse(fs.readFileSync(__dirname + "/map.json"))
);

const monsterManager = new MonsterManager(
  JSON.parse(fs.readFileSync(__dirname + "/monsters.json"))
);

const itemManager = new ItemManager(
  JSON.parse(fs.readFileSync(__dirname + "/items.json"))
);

module.exports = {
  constantManager,
  mapManager,
  monsterManager,
  itemManager,
};
