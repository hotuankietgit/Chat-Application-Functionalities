const express = require("express")
const app = express()
const cors = require("cors");
const server = require('http').Server(app)
const io = require('socket.io')(server, {cors: "*"})

app.use(cors({
    origin: '*'
}));

app.get('/', (req,res) =>{
    res.send("Hello");
})

io.on('connection', (socket) =>{

    socket.on("joinRoom", async (info) => {
        socket.name = info.userName;
        socket.join(info.roomName);
        socket.to(info.roomName).emit("newUserJoin", info.id);
        
        var size = io.of('/').adapter.rooms.get(info.roomName).size;
        var people = await io.in(info.roomName).fetchSockets()
        var users = people.map(socket => ({name: socket.name}))
        
        socket.emit("numberPeople", size, users);
        socket.to(info.roomName).emit("numberPeople", size, users);
    })

    socket.on("call", info => {
        var object = {streamId: info.streamId, username: info.username}
        socket.to(info.roomname).emit("receive", object)
    })

    socket.on("leaveRoom", async (info) => {
        socket.to(info.roomname).emit("userLeave", info);
        socket.leave(info.roomname);
        if (io.of('/').adapter.rooms.get(info.roomname)){
            var size = io.of('/').adapter.rooms.get(info.roomname).size;
            var people = await io.in(info.roomname).fetchSockets()
            var users = people.map(socket => ({name: socket.name}))
        } 
        socket.emit("numberPeople", size, users);
        socket.to(info.roomname).emit("numberPeople", size, users);
    })

    socket.on('message', info => {
        socket.to(info.roomname).emit('userMessage', info);
    })
})

server.listen(8080)