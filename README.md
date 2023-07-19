# Noom

Zoom clone using NodeJS, WebRTC and Websockets

- install nodemon

```
npm i nodemon -D
```

### sever 구동
```
server.js 는 백엔드 역할은 한다.

// http 와 ws 프로토콜을 동시에 여는 작업을 하고
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on을 통해 브라우저가 연결될때마다 작동 시킨다.
```

### socket 이벤트
```
# message
서버에서 메세지를 받을때 또는 브라우저에서 메세지를 받을때

# open 
소캣이 연결되었을때

# close
연결이 끊길때

```

### socket IO
```
# 역할
framework로 실시간, 양방향, event 기반의 통신을 가능하게 함 (websocket을 이용)

SocketIO는 websocket의 부가기능이 아니다. websocket을 사용하는것. 만약 websocket이 지원이 안되면 다른것을 사용한다.

# 설치 
npm install socket.io

# socket.io 열기
const io = SocketIO(server);
```