const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const crypto = require("crypto");

const { constantManager, mapManager } = require("./datas/Manager");
const { User, Item, Player } = require("./models");
const { encryptPassword } = require("./util");
const attack = require('./controller/attack');
const move = require('./controller/move')


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);


const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);
  const [bearer, key] = authorization.split(" ");
  if (bearer !== "Bearer") return res.sendStatus(401);
  const player = await Player.findOne({ key });
  if (!player) return res.sendStatus(401);

  req.player = player;
  next();
};

app.get("/", (req, res) => {
  res.render("index", { gameName: constantManager.gameName });
});

app.get("/game", (req, res) => {
  res.render("game");
});

app.get("/temp", (req, res) => {
  res.render("temp");
})

app.get("/ending", (req, res) => {
  res.render("ending");
})


app.post("/login", async (req, res) => {
  const { id, password } = req.body;
  const user = await User.findOne({ id, password: encryptPassword(password) });
  if(!user) return res.send({ error: "잘못된 아이디 혹은 비밀번호 입니다."}, 400);

  const player = await Player.findOne({ user });
  const key = crypto.randomBytes(24).toString("hex");
  player.key = key;
  await player.save();

  return res.send({ key });
});

// 회원가입 조건 : id, password에 대한 글자수 제한? 등 기능 추가하기
app.post("/register", async (req, res) => {
  const { id, password, repassword } = req.body;

  // 회원가입 조건 더 추가해주기
  if (password !== repassword) return res.send({error: "비빌번호를 다시 확인해주세요."}, 400);
  if (await User.exists({ id })) return res.send({ error: "이미 있는 아이디입니다."}, 400);

  const encryptedPassword = encryptPassword(password);
  const user = new User({ id, password: encryptedPassword });
  const player = new Player({ name: id, user , state: {status: 0}});
  user.player = player;
  await user.save();
  await player.save();

  return res.send('가입이 완료되었습니다. 로그인 후 진을 키워주세요!');
})

app.post("/move", authentication, move)

app.get("/attack", authentication, (req, res) => {
  console.log('hi attack!');
})

app.get("/run", authentication, (req, res) => {
  console.log('hi run!');
})

app.get("/ending", authentication, (req, res) => {
  console.log('hi ending!');
})

app.get("/reset", authentication, (req, res) => {
  console.log('hi reset!');
})

app.get("/view", authentication, async (req, res) => {
  res.send(req.player);
})

app.post("/action", authentication, async (req, res) => {
  const { action } = req.body;
  const player = req.player;
  let event = null;
  let field = null;
  let actions = [];
  if (action === "query") {
    field = mapManager.getField(req.player.x, req.player.y);
  } else if (action === "move") {
    const direction = parseInt(req.body.direction, 0); // 0 북. 1 동 . 2 남. 3 서.
    let x = req.player.x;
    let y = req.player.y;
    if (direction === 0) {
      y -= 1;
    } else if (direction === 1) {
      x += 1;
    } else if (direction === 2) {
      y += 1;
    } else if (direction === 3) {
      x -= 1;
    } else {
      res.sendStatus(400);
    }
    field = mapManager.getField(x, y);
    if (!field) res.sendStatus(400);
    player.x = x;
    player.y = y;

    const events = field.events;
    const actions = [];
    if (events.length > 0) {
      // TODO : 확률별로 이벤트 발생하도록 변경
      const _event = events[0];
      if (_event.type === "battle") {
        // TODO: 이벤트 별로 events.json 에서 불러와 이벤트 처리

        event = { description: "늑대와 마주쳐 싸움을 벌였다." };
        player.incrementHP(-1);
      } else if (_event.type === "item") {
        event = { description: "포션을 획득해 체력을 회복했다." };
        player.incrementHP(1);
        player.HP = Math.min(player.maxHP, player.HP + 1);
      }
    }

    await player.save();
  }

  field.canGo.forEach((direction, i) => {
    if (direction === 1) {
      actions.push({
        url: "/action",
        text: i,
        params: { direction: i, action: "move" }
      });
    }
  });

  return res.send({ player, field, event, actions });
});

app.listen(3000);
