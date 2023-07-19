const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName;

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
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
    h3.innterText = `Room ${roomName}`
    input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);