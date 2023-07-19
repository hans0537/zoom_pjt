const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    // 내가 속한 방에 메세지를 보내야하므로 roomName도 넘겨주기
    socket.emit("new_message", value, roomName, () => {addMessage(`You: ${value}`)});
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", value);
    input.value = "";
}


function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");

    // 메세지를 보내거나 이벤트를 넘겨준다. 꼭 메세지를 넘겨줄 필요 없이
    // 첫번째 인자: 메세지 또는 이벤트 이름
    // 두번째 인자 ~ 다양한 인자를 통해 여러가지를 보낼 수 있음 (data, 함수, ....)
    // 만약 끝날때 실행되는 function을 보내려면 마지막 인자에 넣기
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;

    addMessage(`${user} arrived!`);
})

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;

    addMessage(`${left} left ㅠㅠ`);
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";

    if(rooms.length === 0) {
        return;
    }

    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.appendChild(li);
    })
});