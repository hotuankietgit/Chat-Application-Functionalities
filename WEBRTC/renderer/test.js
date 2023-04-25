const { ipcMain } = require("electron");
let FakeStream = true;
const socket = io('http://localhost:8080', {closeOnBeforeunload: false});
var store = "background-image: url('abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner_1258-54362.webp'); background-size: cover;"
var joinRoom = document.getElementById("joinRoom");
var leaveRoom = document.getElementById("leaveRoom");
var MenuScreen = document.getElementById("Menu");
var Room = document.getElementById("Room");
var microphone = document.getElementById("microphone");
var camera = document.getElementById("camera");
var microphoneIcon = document.getElementById("microphoneIcon");
var microphoneIconSlash = document.getElementById("microphoneIconSlash");
var cameraIcon = document.getElementById("cameraIcon");
var cameraIconSlash = document.getElementById("cameraIconSlash");
var videoIcon = document.getElementById("videoIcon");
var videoIconSlash = document.getElementById("videoIconSlash");
var sendMessage = document.getElementById("sendMessage");
var message = document.getElementById("Message");
var info = document.getElementById("info");
var record = document.getElementById("record");
let recorder;

const {ipcRenderer} = require("electron");

//Choose screen to record on the drop-up menu list
async function selectScreen(id) {
    try{
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: id,
                        minWidth: 1280,
                        maxWidth: 1280,
                        minHeight: 720,
                        maxHeight: 720
                    }
                }
            })
        
            let Recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' })
        
            let dataChunk = []
            
            Recorder.addEventListener("dataavailable", (e) => {
                dataChunk.push(e.data);
            })
        
            Recorder.addEventListener("stop", () => {
                let blob = new Blob(dataChunk, {
                    type: dataChunk[0].type
                })
                let url = URL.createObjectURL(blob)
                let videoDownload = document.createElement("video");
                videoDownload.src = url;
        
                let a = document.createElement('a');
                a.href = url;
                a.download = Date.now().toString(36) + Math.random().toString(36).substr(2) + ".webm";
                a.click();
                URL.revokeObjectURL(blob);
                videoIcon.hidden = false;
                videoIconSlash.hidden = true;
            })
        
            if (videoIcon.hidden == true && videoIconSlash.hidden == false){
                record.onclick = () => {
                    Recorder.stop();
                }
            }
            Recorder.start();
    }catch (e) {
        videoIcon.hidden = false;
        videoIconSlash.hidden = true;
    }
}


//When user join Room
joinRoom.onclick = (e) => {
    e.preventDefault();
    MenuScreen.hidden = true;
    Room.hidden = false;

    const userName = document.getElementById("username").value;
    const roomName = document.getElementById("room").value;

    //const myPeer = new Peer();
    //myPeer.on('open', (id) => {
    //    console.log(id);
    //    var info = {id,userName,roomName}
    //    socket.emit("joinRoom", info)
    //})

    //Send message
    socket.on("userMessage", info => {
        console.log(info);
        displayClientMessage(info);
    })

    //Remove all the people in the room on your browser when you leave room
    function removeAllParticipants(){
        var div = document.getElementsByClassName("modal-body people")[0];
        while (div.firstChild){
            div.firstChild.remove();
        }
    }

    //Remove all the chat message in the room when you leave the room from your browser
    function removeAllChatMessage(){
        var div = document.getElementsByClassName("chatBox");
        while (div.firstChild){
            div.firstChild.remove();
        }
    }

    //Update all the people joined and shows it when click on the people button
    function updateAllParticipants(users){
        var div = document.getElementsByClassName("modal-body people")[0];
        users.forEach(user => {
            var d = new Date();
            var divUser = document.createElement("div");
            divUser.className = "user";

            var divAva = document.createElement("div");
            divAva.className = "avatar";
            divAva.innerHTML = user.name.charAt(0);

            var divUserInfo = document.createElement("div");
            divUserInfo.className = "user-info";

            var divUsername = document.createElement("div");
            divUsername.className = "user-name";
            divUsername.innerHTML = user.name;

            var divUserOnline = document.createElement("div");
            divUserOnline.className = "online";
            divUserOnline.innerHTML =  "Joined at " + d.getHours() + ":" + d.getMinutes();

            var status = document.createElement("div");
            status.className = "status";

            var divSmall = document.createElement("div");
            divSmall.className = "badge badge-success badge-pill";
            divSmall.innerHTML = "Online";

            divUserInfo.appendChild(divUsername);
            divUserInfo.appendChild(divUserOnline);

            status.appendChild(divSmall);

            divUser.appendChild(divAva);
            divUser.appendChild(divUserInfo);
            divUser.appendChild(status);

            div.appendChild(divUser);
        })
        
    }

    //get number of people in the room from socket
    socket.on("numberPeople", (size, users) => {
        var span = document.getElementById("infoPeople");
        span.innerHTML = size;
        removeAllParticipants();
        updateAllParticipants(users);
    })

    //When click on the info button, name and room should be shown
    info.onclick = () => {
        var divUser = document.getElementById("infoUser");
        var divRoom = document.getElementById("infoRoom");
        divRoom.innerHTML = roomName;
        divUser.innerHTML = userName;
    }

    //Send message to the socket
    sendMessage.onclick = (e) => {
        e.preventDefault();
        socket.emit("message", {roomname: roomName, username: userName, message: message.value});
        displayOwnMessage(message.value);
        message.value = "";
    }

    //Display your message
    function displayOwnMessage(message){
        var d = new Date();
        var chatbox = document.getElementsByClassName("chatBox")[0];
        var div1 = document.createElement('div');
        div1.className = "d-flex flex-row justify-content-end mb-4";
        
        var div2 = document.createElement('div');
        div2.className = "p-3 me-3 border";
        div2.style = "border-radius: 15px; background-color: rgba(57, 192, 237,.2);";

        var p = document.createElement('p');
        p.className = "small mb-0";
        p.style="color:#fbfbfb"
        p.innerHTML = message;

        var p2 = document.createElement('p');
        p2.className = "small mb-0 font-weight-light";
        p2.style="color:#fbfbfb";
        p2.innerHTML = userName + " at " + d.getHours() + ":" + d.getMinutes();

        div2.appendChild(p2);
        div2.appendChild(p);
        div1.appendChild(div2);
        chatbox.appendChild(div1);
    }

    //Display other people message
    function displayClientMessage(info){
        var d = new Date();
        var chatbox = document.getElementsByClassName("chatBox")[0];
        var div1 = document.createElement('div');
        div1.className = "d-flex flex-row justify-content-start mb-4";
        
        var div2 = document.createElement('div');
        div2.className = "p-3 ms-3";
        div2.style = "border-radius: 15px; background-color: #fbfbfb;";

        var p = document.createElement('p');
        p.className = "small mb-0";
        p.innerHTML = info.message;

        var p2 = document.createElement('p');
        p2.className = "small mb-0 font-weight-light";
        p2.innerHTML = info.username + " at " + d.getHours() + ":" + d.getMinutes();

        div2.appendChild(p2);
        div2.appendChild(p);
        div1.appendChild(div2);
        chatbox.appendChild(div1);
    }


    function Receive() {
        socket.on("receive", info => {
            var div = document.createElement("div");
            div.className = "overlay";
            div.style = "font-size: 20px; position: absolute; top:0;left:25%;z-index:1;color:white;";
            div.innerHTML = info.username;
            console.log(div);
            var faDiv = document.getElementById(info.streamId);
            if (faDiv){
                faDiv.appendChild(div);
                console.log(faDiv);
            }else{
                console.log("Falied");
            }
        })
    }

    function callOtherClient(stream, id){
        var call = myPeer.call(id, stream);
        socket.emit("call", {streamId :stream.id, username: userName, roomname: roomName});
        call.on('stream', remoteStream => {
            displayClientVideoStream(remoteStream);
        })
    }

    //Display your camera video
    function displayOwnVideoStream(stream){
        var ownVideo = document.getElementById("ownVideo");
        var video = document.createElement('video');
        video.style="position: relative; z-index:0";
        var div = document.createElement("div");
        div.className = "overlay";
        div.style = "font-size: 20px; position: absolute; top:0;left:25%;z-index:1;color:white;";
        div.innerHTML = userName;
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        })
        ownVideo.appendChild(video);
        ownVideo.appendChild(div);
        return video;
    }
    
    //display other camera video
    function displayClientVideoStream(stream){
        var clientVideo = document.getElementById("clientVideo");
        var div = document.createElement('div');
        div.className = "col-md-4";
        div.id = stream.id;

        if (document.getElementById(stream.id)){
            return;
        }
        var video = document.createElement('video');
        video.style="position: relative; z-index:0";
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        })
        div.appendChild(video);
        clientVideo.appendChild(div);
    }

    //Use session storage to store other people name along with their stream id in order to show their name on their camera video
    socket.on("receive", info => {
        sessionStorage.setItem(info.username, info.streamId);
    })

    //Put the name overlay the video
    function putNameToStream(){
        Object.keys(sessionStorage).forEach(key => {
            var streamId = sessionStorage.getItem(key);
            var div = document.createElement("div");
            div.className = "overlay";
            div.style = "font-size: 20px; position: absolute; top:25%;left:25%;z-index:1;color:white;";
            div.innerHTML = key;
            var faDiv = document.getElementById(streamId);
            if(faDiv){
                faDiv.appendChild(div);
                sessionStorage.removeItem(key);
            } 
        })
    }

    //Real time loading every 1 second, when someone call us
    setInterval(putNameToStream, 1000);

    //talk to main js in electron, request all the possible screen, window to start recoding
    ipcRenderer.send("recording");

    //get back all, get back all the possible screen, window to start recoding
    ipcRenderer.on("all_source", (event,source) => {
        var div = document.getElementsByClassName("dropdown-menu")[0];
        source.forEach(s => {
            var but = document.createElement("button");
            but.className = "dropdown-item";
            but.id = s.id;
            but.setAttribute("onclick","selectScreen(this.id)");
            but.innerHTML = s.name;
            div.appendChild(but);
        })
    })

    ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
        try {
          let RecordStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
              }
            }
          })
          recorder = selectScreen(RecordStream);
          recorder.start();
        } catch (e) {
            recorder.stop();
            videoIcon.hidden = false;
            videoIconSlash.hidden = true;
        }
    })

    //Click the record button
    record.onclick = () => {
        if (videoIcon.hidden == false){
            //Do record
            videoIcon.hidden = true;
            videoIconSlash.hidden = false;
            
        }else if (videoIcon.hidden == true){
            //Stop recording
            videoIcon.hidden = false;
            videoIconSlash.hidden = true;
        }
    }

    //Allow access to your camera video 
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    }).then(stream => {
        const myPeer = new Peer();
        //initialize peer, when receive the peer id, join the socket room
        myPeer.on('open', (id) => {
            console.log(id);
            var info = {id,userName,roomName}
            socket.emit("joinRoom", info)
        })

        //function to call other people
        function callOtherClient(stream, id){
            //send actual stream peer to peer
            var call = myPeer.call(id, stream);
            //socket only send the name, stream id (string)
            socket.emit("call", {streamId :stream.id, username: userName, roomname: roomName});
            //recieve the actual stream peer to peer
            call.on('stream', remoteStream => {
                displayClientVideoStream(remoteStream);
            })
        }

        var Video = displayOwnVideoStream(stream);
        cameraIconSlash.hidden = true;
        microphoneIconSlash.hidden = true;
        myPeer.on('call', call => {
            call.answer(stream);
            socket.emit("call", {streamId: stream.id, username: userName, roomname: roomName});
            call.on("stream", remoteStream => {
                displayClientVideoStream(remoteStream);
            })
        })

        socket.on("newUserJoin", id => {
            callOtherClient(stream, id);
        })

        //Microphone off
        microphone.onclick = () => {
            if (microphoneIcon.hidden == false){
                stream.getTracks().forEach(function(track) {
                    if (track.readyState == 'live' && track.kind === 'audio') {
                        track.enabled = false;
                    }
                });
                microphoneIcon.hidden = true;
                microphoneIconSlash.hidden = false;
            }else{
                stream.getTracks().forEach(function(track) {
                    if (track.readyState == 'live' && track.kind === 'audio') {
                        track.enabled = true;
                    }
                });
                microphoneIcon.hidden = false;
                microphoneIconSlash.hidden = true;
            }
        }
        //Camera off
        camera.onclick = () => {
            if (cameraIcon.hidden == false){
                stream.getTracks().forEach(function(track) {
                    if (track.readyState == 'live' && track.kind === 'video') {
                        track.enabled = false;
                    }
                });
                cameraIcon.hidden = true;
                cameraIconSlash.hidden = false;
            }else{
                stream.getTracks().forEach(function(track) {
                    if (track.readyState == 'live' && track.kind === 'video') {
                        track.enabled = true;
                    }
                });
                cameraIcon.hidden = false;
                cameraIconSlash.hidden = true;
            }
        }

        window.onbeforeunload = () => {
            socket.emit("leaveRoom", {username: userName,roomname: roomName, streamId: stream.id});
            return null;
        }

        //click on the phone slash to leave the room
        leaveRoom.onclick = () => {
            socket.emit("leaveRoom", {username: userName,roomname: roomName, streamId: stream.id})
            //Remove the stream
            stream.getTracks().forEach(function(track) {
                if (track.readyState == 'live') {
                    track.stop();
                    FakeStream = false;
                }
            });

            //remove the video on your own
            var div = document.getElementById("ownVideo");
            while(div.firstChild){
                div.firstChild.remove();
            }

            //remove all client video stream
            var divFa = document.getElementById("clientVideo");
            while(divFa.firstChild){
                divFa.firstChild.remove();
            }

            var divChat = document.getElementsByClassName("chatBox")[0];
            while(divChat.firstChild){
                divChat.firstChild.remove();
            }

            var span = document.getElementById("infoPeople");
            span.innerHTML = "";
            removeAllParticipants();
            removeAllChatMessage();
            
            MenuScreen.hidden = false;
            Room.hidden = true;
        }

        socket.on("userLeave", info => {
            //delete the div that has stream id
            var divFa = document.getElementById("clientVideo");
            var div = document.getElementById(info.streamId);
            divFa.removeChild(div);
        })

    }).catch((e) => {
        //allow users to join without stream
        if (FakeStream == true){
            const createMediaStreamFake = () => {
                return new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack({ width:640, height:480 })]);
            }
          
            const createEmptyAudioTrack = () => {
              const ctx = new AudioContext();
              const oscillator = ctx.createOscillator();
              const dst = oscillator.connect(ctx.createMediaStreamDestination());
              oscillator.start();
              const track = dst.stream.getAudioTracks()[0];
              return Object.assign(track, { enabled: false });
            }
          
            const createEmptyVideoTrack = ({ width, height }) => {
              const canvas = Object.assign(document.createElement('canvas'), { width, height });
              canvas.getContext('2d').fillRect(0, 0, width, height);
            
              const stream = canvas.captureStream();
              const track = stream.getVideoTracks()[0];
            
              return Object.assign(track, { enabled: false });
            };
    
            //create a fake stream
            var stream = createMediaStreamFake();
            //var Video = displayOwnVideoStream(stream);
            var ownVideo = document.getElementById("ownVideo");
            var video = document.createElement('video');
            video.srcObject = stream;
            video.addEventListener("loadedmetadata", () => {
                video.play();
            })
            video.loop=true;
            ownVideo.appendChild(video);
            
            cameraIcon.hidden = true;
            microphoneIcon.hidden = true;
            cameraIconSlash.hidden = false;
            microphoneIconSlash.hidden = false;
    
            window.onbeforeunload = () => {
                socket.emit("leaveRoom", {username: userName,roomname: roomName, streamId: stream.id});
                return null;
            }
    
            myPeer.on('call', call => {
                call.answer(stream);
                call.on("stream", remoteStream => {
                    displayClientVideoStream(remoteStream);
                })
            })
    
            socket.on("newUserJoin", id => {
                var call = myPeer.call(id, stream);
                call.on('stream', remoteStream => {
                    displayClientVideoStream(remoteStream);
                })
            })
    
            leaveRoom.onclick = () => {
                socket.emit("leaveRoom", {username: userName,roomname: roomName, streamId: stream.id})
                //Remove the stream
                stream.getTracks().forEach(function(track) {
                    if (track.readyState == 'live') {
                        track.stop();
                    }
                });
    
                //remove the video on your own
                var div = document.getElementById("ownVideo");
                while(div.firstChild){
                    div.firstChild.remove();
                }
    
                //remove all client video stream
                var divFa = document.getElementById("clientVideo");
                while(divFa.firstChild){
                    divFa.firstChild.remove();
                }
    
                var divChat = document.getElementsByClassName("chatBox")[0];
                while(divChat.firstChild){
                    divChat.firstChild.remove();
                }
    
                var span = document.getElementById("infoPeople");
                span.innerHTML = "";
                removeAllParticipants();
                removeAllChatMessage();
                MenuScreen.hidden = false;
                Room.hidden = true;
            }
    
            socket.on("userLeave", info => {
                //delete the div that has stream id
                var divFa = document.getElementById("clientVideo");
                var div = document.getElementById(info.streamId);
                divFa.removeChild(div);
            })
        }     
    })
}

