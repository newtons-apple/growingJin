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

// const handleInit = () => {

// }

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

export { handleLogin, handleMove, handleAttack, handleRun, handleEnding };