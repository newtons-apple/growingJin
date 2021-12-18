# growingJin

jin을 키워보자..!


###/move
갈 수 있는 맵의 범위 내에서 1칸씩 이동한다.
만약 갈 수 없는 곳으로 요청이 들어왔다면 {error:''}
request
 - 0,1,2,3(동,서,남,북)으로 이동
 - header = {key:Bearer + key}
 - body = {direction : [방향]}

response
 - {mapDesc:"string", }