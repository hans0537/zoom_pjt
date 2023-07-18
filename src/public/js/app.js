const messageList = document.querySelector('ul');
const messageForm = document.querySelector('form');

// 브라우저에는 기본적으로 websocket이 제공된다.
const socket = new WebSocket(`ws://${window.location.host}`);

// 서버와 연결 되었을때
socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

// 서버로부터 메세지를 받을떄
socket.addEventListener("message", (message) => {
    console.log("New Message: ", message.data);
});

// 서버가 연결이 끊어졌을때
socket.addEventListener("close", () => {
    console.log("Disconnected from Server");
});

// 서버에게 메세지를 보낸다
// setTimeout(() => {
//     socket.send("hello from the browser!");
// }, 10000);

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(input.value);
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit)