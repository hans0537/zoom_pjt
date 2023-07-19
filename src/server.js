import http from "http";
// import WebSocket from "ws";
import express from "express";
import SocketIO from "socket.io";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"))
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.render("home"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

const server = http.createServer(app);
// http 와 ws 프로토콜을 동시에 여는 작업
// const wss = new WebSocket.Server({ server });

// 참가자들을 넣어둘 배열
const sockets = [];

/*
// ws소캣이 열릴때마다 작동 (브라우저와 연결될때마다)
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anonimous";

    console.log("Connected to Browser");
    // 만약 브라우저가 꺼지면 알림받는다
    socket.on("close", () => console.log("Disconnected from the Browser"))

    // 브라우저를 통해 받은 메세지
    let name = "";
    socket.on("message", (msg) => {
        msg = msg.toString("utf-8")

        const message = JSON.parse(msg);

        switch(message.type) {
            case "new_message":
                sockets.forEach(aSocket => {
                    aSocket.send(`${socket.nickname} : ${message.payload}`);
                });
            case "nickname":
                // 각 소캣에 정보를 담을 수 있다. (key: value)
                socket["nickname"] = message.payload;
        }
      
        console.log(message);
    })

    // 브라우저로 메세지를 보낸다
    socket.send("hello!!");
});
*/
// socket.io 열기
const io = SocketIO(server);

io.on("connection", socket => {
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })

    socket.on("enter_room", (roomName, done) => { // 보낸 인자에 맞게 param 맞추기
        socket.join(roomName);
        done();
    })
})


server.listen(3000, handleListen);
