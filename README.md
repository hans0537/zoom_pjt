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

### socket.io Admin

```
npm i @socket.io/admin-ui
```


### 비디오 연동

```
https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

// 유저의 카메라와 오디오를 가져옴
navigator.mediaDevices.getUserMedia();

1. 비디오 켜기
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            {
                audio: true,
                video: true,
            }
        );
        myFace.srcObject = myStream;
        console.log(myStream);
    } 
    catch(e) {
        console.log(e);
    }

2. 마이크 온 오프
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);

3. 카메라 온 오프
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);

4. 카메라 후면 전면 전환
    getUserMedia(constraints) 제약 조건을 지정
    {
        audio: true,
        // 셀피 모드
        video: { facingMode: "user" },
    }        

// 모든 장치와 미디어 장치를 가져옴 (컴퓨터와 모바일이 가지고 있는 모든 장치 정보)
await navigator.mediaDevices.enumerateDevices();

```
