const key = localStorage.getItem('_key');

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

const handleView = () => {
  $.ajax({
    url: '/view',
    headers: {
      Authorization: "Bearer " + key
    },
    method: "GET"
  }).done(res => {
    const { x, y, level, exp, HP, maxHP, str, def, state, items } = res;
    // const { isFighting, enemy, log } = state;
    const levelSet = {1: '아기 진', 2: '청소년 진', 3: '개발자 진', 4: 'CEO 진'};
    const expSet = {1: ['키', 'cm'], 2: ['성적', '점'], 3: ['git commit', '번'], 4: ['기업 가치', '억']};
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
    const log = `담당 일진(이)가 나타났다. <br/> 진아 빵좀 사와라... 진아 빵좀 사와라... 진아 빵좀 사와라...`;
    const isFighting = 'true';

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
    }

    if (level === 4) $('.ending-btn').removeClass('hide');

    $('.map').html(makeMap(x, y, level));
  })

}


const sendAction = (url, params = {}) => {
  $.ajax({
      url,
      headers: {
      Authorization: "Bearer " + key
      },
      method: "POST",
      data: $.param(params),
  }).done((req) => {
      const { player, field, event, actions } = req;

      $('#game').text(field.description);
      $('#position').text(`(${field.x},${field.y})`);
      const x = field.x;
      const y = field.y;

      $('#control').html('');
      req.actions.forEach((action) => {
          const dom = $('<button></button');
          dom.text(action.text);
          dom.bind('click', function () {
              sendAction(action.url, action.params);
          });

          $('#control').append(dom);
      })

      if (event) {
          $('#event_result').text(event.description);
          } else {
          $('#event_result').text("아무일도 일어나지 않았다.");
      }

      $('#HP').text(`${player.HP} / ${player.maxHP}`)
  });
} 

const handleMove = (domDirection) => {
    $.ajax({
        url: '/move',
        headers: {
          Authorization: "Bearer " + key
        },
        method: "POST",
        data: {
            direction: domDirection
        },
      })
}

const handleAttack = () => {
    $.ajax({
        url: '/attack',
        headers: {
          Authorization: "Bearer " + key
        },
        method: "POST",
        data: {
            canRun: false
        },
      })
}

const handleRun = () => {
    $.ajax({
        url: '/run',
        headers: {
          Authorization: "Bearer " + key
        },
        method: "POST",
      })
}

const handleEnding = () => {
    $.ajax({
        url: '/ending',
        headers: {
          Authorization: "Bearer " + key
        },
        method: "POST",
      })
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

export { handleLogin, handleView, handleMove, handleAttack, handleRun, handleEnding };