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
    const { x, y, level, exp, HP, maxHP, str, def } = res;
    const levelSet = {1: '아기 진', 2: '청소년 진', 3: '개발자 진', 4: 'CEO 진'};
    const expSet = {1: ['키', 'cm'], 2: ['성적', '점'], 3: ['코딩 실력', ''], 4: ['기업 가치', '억']};

    $('#level').text(`Level : ${level} (${levelSet[level]}) `);
    $('#hp').text(`체력 : ${HP} / ${maxHP} `);
    $('#str').text(`공격력 : ${str} `);
    $('#def').text(`방어력 : ${def} `);
    $('#exp').text(`${expSet[level][0]} : ${exp} `);
    
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