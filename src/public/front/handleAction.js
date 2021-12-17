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
        })
    })
}

const handleAction = async (action, method, data) => {
  const res = await sendRequest(`/${action}`, method, data);
  const { x, y, level, exp, HP, maxHP, str, def, state, items } = res;
  // const { isFighting, enemy, log } = state;
  
  // 추후 삭제
  items.push('맥북 : 1 개 (임시)');
  items.push('연필 : 3 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  items.push('쪽쪽이 : 2 개 (임시)');
  const log = state ? state.log : `담당 일진(이)가 나타났다. <br/> 진아 빵좀 사와라... 진아 빵좀 사와라... 진아 빵좀 사와라...`;
  const isFighting = state ? state.isFighting : 'true';

  $('#level').text(`Level : ${level} (${levelSet[level]}) `);
  $('#hp').text(`체력 : ${HP} / ${maxHP} `);
  $('#str').text(`공격력 : ${str} `);
  $('#def').text(`방어력 : ${def} `);
  $('#exp').text(`${expSet[level][0]} : ${exp} ${expSet[level][1]} `);
  $('.display_event_line').html(log);
  items.forEach(item => {
    const dom = $('<div class="item"></div>');
    dom.text(item);
    $('.inventory').append(dom);
  })

  // true 가 문자열로 오진 않는지 체크
  if (isFighting) {
    $('.attack-btn').removeClass('hide');
    $('.run-btn').removeClass('hide');
  } else {
    $('.attack-btn').addClass('hide');
    $('.run-btn').addClass('hide');
  }

  if (level === 4) $('.ending-btn').removeClass('hide');
  else $('.ending-btn').addClass('hide');

  $('.map').html(makeMap(x, y, level));
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

export { handleLogin, handleAction };