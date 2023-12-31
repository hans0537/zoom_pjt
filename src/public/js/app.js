const socket = io();

const myFace = document.getElementById("myFace");

const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;


async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");

        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;

            if(currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })

    }catch(e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    // 유저가 처음 들어왔을때의 설정
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    };

    const cameraConstraints = {
        audio: true,
        video: {deviceId: { exact : deviceId } },
    };

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream;
        
        // 중복 카메라
        if(!deviceId) await getCameras();
    } 
    catch(e) {
        console.log(e);
    }
}

function handleMuteClick () {
    // 스트림을 통해 마이크 정보 가져옴
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    
    if(!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute"; 
        muted = false;
    }
}

function handleCameraClick () { 
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    
    if(cameraOff) {
        cameraBtn.innerText = "Camera Off";
        cameraOff = false; 
    }else {
        cameraBtn.innerText = "Camera On"; 
        cameraOff = true; 
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
    if(myPeerConnection) {
        // 나의 videotrack을
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        console.log(videoSender);
        // 상대방한테도 바꾼다
        videoSender.replaceTrack(videoTrack)
    }

}
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form (방 선택 이후 카메라 켜짐)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// socket code

// 먼저 방에 들어온 유저 peerA
socket.on("welcome", async () => {
    // Data Channel 생성
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => console.log(event.data));

    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer")
    // 다른 유저가 방에 들어오면 보내준다
    socket.emit("offer", offer, roomName);
})

// peerB
socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) => console.log(event.data));
    })
    console.log("recived the offer")
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer")
})

socket.on("answer", answer => {
    console.log("received the answer")
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    console.log("recived candidate")
    myPeerConnection.addIceCandidate(ice);
})

// RTC code
function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            }
        ]

    });
    myPeerConnection.addEventListener("icecandidate", handleIce);

    myPeerConnection.addEventListener("track", (data) => {
        console.log("이거",data);
        const peerFace = document.getElementById("peerFace");
        peerFace.srcObject = data.streams[0];
    });

    // 나의 영상, 오디오를 peer connection stream에 추가한다
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    console.log("sent candidate")
    socket.emit("ice", data.candidate, roomName);
}
