const key = localStorage.getItem('_key');

const levelSet = {1: '아기 진', 2: '청소년 진', 3: '개발자 진', 4: 'CEO 진'};
const expSet = {1: ['키', 'cm'], 2: ['성적', '점'], 3: ['git commit', '번'], 4: ['기업 가치', '억']};

const sendRequest = async (url, method, body={}) => {
  return await $.ajax({ url, headers: { Authorization: "Bearer " + key}, method, data: body}, );
}

const handleLogin = () => {
    if (key) location.href = '/game';
    const loginForm = $('#login_form');
    loginForm.submit(e => {
        e.preventDefault();
        $.post('/login', loginForm.serialize(), (res) => {
            if(res.key){
                localStorage.setItem('_key', res.key);
                location.href = '/game';
            } else alert("에러가 발생했습니다. 다시 시도해주세요.");
        }).fail(() => alert("아이디와 비밀번호를 확인해주세요!"));
    })
}

const handleAction = async (action, method, data) => {
  const res = await sendRequest(`/${action}`, method, data);

  const { x, y, level, exp, HP, maxHp, str, def, state, items, auto, mapDesc, maxItemQuantity } = res;
  const { status, log } = state;

  $('.reset-btn').addClass('hide');
  $('.attack-btn').addClass('hide');
  $('.run-btn').addClass('hide');
  $('.ending-btn').addClass('hide');
  $('.move-btn').addClass('hide');
  if (level === 4) $('.ending-btn').removeClass('hide');

  // 자동공격시 대화창 표현 로직
  if (auto) {
    $('.move-btn').addClass('hide');
    const autoAttackLog = log.split("\n");
    let curLog = "";
    for (const eachLog of autoAttackLog){
      curLog += eachLog + "\n";
      $('.display_event_line').html(curLog.replaceAll("\n", "<br/>"));
      $(".display-container").scrollTop($(".display-container")[0].scrollHeight);
      await sleep(500);
    }
  } else {
    $('.display_event_line').html(log.replaceAll("\n", "<br/>"));
    $(".display-container").scrollTop($(".display-container")[0].scrollHeight);
  }

  $('#profile-img').attr("src", `../images/${level}.png`)
  $('#level').text(`Level : ${level} (${levelSet[level]}) `);
  $('#hp').text(`체력 : ${HP} / ${maxHp} `);
  $('#str').text(`공격력 : ${str} `);
  $('#def').text(`방어력 : ${def} `);
  if (level === 4) $('#exp').text(`${expSet[level][0]} : ${exp} ${expSet[level][1]}`)
  else $('#exp').text(`${expSet[level][0]} : ${exp} / 100 ${expSet[level][1]}`);
  $('.map-description').text(`${mapDesc}`);
  $('.map').html(makeMap(y, x, level));
  $('.inventory_title').text(`가방 - ${countItems(items)} / ${maxItemQuantity} 개`);
  $('.inventory').empty();
  items.forEach(({ name, quantity }) => {
    const dom = $('<div class="item"></div>');
    dom.text(`${name} : ${quantity} 개`);
    $('.inventory').append(dom);
  })

  // 버튼의 활성화 여부
  if (status === 0) {
    $('.reset-btn').removeClass('hide');
    $('.move-btn').removeClass('hide');
  }
  else if (status === 1)  $('.move-btn').removeClass('hide');
  else if (status === 2)  {
    $('.attack-btn').removeClass('hide');
    $('.move-btn').removeClass('hide');
  }
  else if (status === 3){
    $('.attack-btn').removeClass('hide');
    $('.run-btn').removeClass('hide');
  }
}


const makeMap = (x, y, level) => {
  const canGoHeight = {'1': [0, 0], '2': [1, 2], '3': [3, 5], '4': [6, 9]};
  let map = '';
  const canGoLine = "□ ".repeat(10) + "<br/>";
  const nowLine = "□ ".repeat(x) + "■ " + "□ ".repeat(9 - x) + "<br/>";
  const canNotGoLine = "▧ ".repeat(10) + "<br/>";
  const [bottom, top] = canGoHeight[level];

  for (let i = 9; i >= 0; i--){
      if (i > top || i < bottom) map += canNotGoLine;
      else if (y === i) map += nowLine;
      else map += canGoLine;
  }
  return map;
}

const countItems = (items) => {
  return items.reduce((acc, item) => {
    return acc += item.quantity
  }, 0);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));


export { handleLogin, handleAction };
