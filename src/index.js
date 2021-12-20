const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const crypto = require("crypto");

const { constantManager, mapManager } = require("./datas/Manager");
const { User, Item, Player } = require("./models");
const { encryptPassword } = require("./util");
const attack = require('./controller/attack');
const move = require('./controller/move');
const reset = require('./controller/reset');
const run = require('./controller/run');


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
  const player = new Player({ name: id, user , state: {status: 0, log: "진 키우기에 오신걸 환영합니다!"}});
  user.player = player;
  await user.save();
  await player.save();

  return res.send('가입이 완료되었습니다. 로그인 후 진을 키워주세요!');
})

app.post("/move", authentication, move);

app.get("/attack", authentication, attack);

app.get("/run", authentication, run);

app.get("/ending", authentication, (req, res) => {
  console.log('hi ending!');
})

app.get("/reset", authentication, reset);

app.get("/view", authentication, async (req, res) => {
  res.send(req.player);
})

app.listen(3000);
