import http from "http";
// import WebSocket from "ws";
import express from "express";
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
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
const io = new Server(server, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
instrument(io, {
    auth: false,
})
// 공개 방 찾기
function publicRooms() {
    // const sids = io.sockets.adapter.sids; => 개인 방 id를 가져옴
    // const rooms = io.sockets.adapter.rooms; => 전체 방 id를 가져옴
    const {
        sockets: {
            // adapter는 열려있는 socket의 정보를 다 가지고 있음
            adapter: {sids, rooms},
        },
    } = io;

    const publicRooms = [];
    // 전제 방 키를 개인방키만 있는 배열과 비교하여 없으면 공개방키인것
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(key)
        }
    });

    return publicRooms
}

// 방 인원 수
function countRoom(roomName) {
    return io.sockets.adapter.rooms.get(roomName)?.size;
}
io.on("connection", socket => {
    socket["nickname"] = "Anon";

    socket.onAny((event) => {
        // console.log(io.sockets.adapter)
        console.log(`Socket Event: ${event}`);
    });

    socket.on("enter_room", (roomName, done) => { // 보낸 인자에 맞게 param 맞추기
        socket.join(roomName);
        done();
        // 같은 roomName이 있으면 그 방에다 welcome 이벤트를 처리
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        io.sockets.emit("room_change", publicRooms());
    });
    
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)); // 방을 아직 안 나간 상태이므로 -1
    });
    
    socket.on("disconnect", () => {
        io.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", (msg, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname} : ${msg}`);
        done();
    });

    socket.on("nickname", (msg) => {socket["nickname"] = msg});

    

})


server.listen(3000, handleListen);
