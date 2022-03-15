const socket = io("/");
const videoGrid = document.getElementById("video-grid");


/* const myPeer = new Peer(undefined, {
	host: "mypeerserver3010.herokuapp.com",
	port: "443", 
	key : "peerjs",
	secure : true,
	config: {'iceServers': [
    	{ url: 'stun:hk-turn1.xirsys.com' },
	    { url: 'turn:hk-turn1.xirsys.com:80?transport=udp', credential: '8942e304-a43c-11ec-9a64-0242ac120004', username: 'a2ERvV-EsmTxFZGF5Tol8mio3SmzEmoRF_px9EVR6N3ZXRv_0zEan6dXcSEUJzcKAAAAAGIwUpxsZWNoaW5odHJ1YzMyMQ==' }
  ]}
}); */

const myPeer = new Peer();
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log(userId + " Connected");
	        setTimeout(function ()
      	{
        connectToNewUser(userId, stream);
      	},15000);
    });
  });

socket.on("user-disconnected", (userId) => {
  console.log("New User Disconnected");
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
   // alert(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  
  video.onloadedmetadata = (event) => {
    video.play();
   // alert("PLAY VIDEO FROM SOME ONE");
  }
  videoGrid.append(video);
}

// URL Copy To Clipboard
document.getElementById("invite-button").addEventListener("click", getURL);

function getURL() {
  const c_url = window.location.href;
  copyToClipboard(c_url);
  alert("Url Copied to Clipboard");
}

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

// End Call
document.getElementById("end-button").addEventListener("click", endCall);

function endCall() {
  window.location.href = "/";
}