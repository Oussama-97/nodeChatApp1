const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const path = require('path');
const {Users} = require('./public/Users');
const PORT = process.env.PORT || 3000;

var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(path.join(__dirname, 'public')));

function createMessageRightHTML (messageContent) {    
    return `<div class="message-right-container">
                <div class="message-right">
                    <p> ${messageContent} </p>
                </div>
            </div>`;
}
function createMessageLeftHTML (messageContent) {
    return `<div class="message-left-container">
                <img src="./icons/blue Icons/user.png" alt="" style="width: 90%; margin-top: 10px;">
                <div class="message-left">
                    <p> ${messageContent} </p>
                </div>
            </div>`
}


io.on('connect', (socket) => {
    console.log('Connected to server', socket.id);
    
    socket.on('join', (data) => {
        //socket.join(socket.id);
        users.addUser(socket.id, data.firstName +' '+ data.lastName)
        io.emit('updateUsersList', users.users);
    });

    socket.on('getUserInfo', (id) => {
        socket.emit('sendingUserInfo', {receiver: users.getUser(id), sender: users.getUser(socket.id)});
    });

    socket.on('sendMessage', (data) => {
        console.log(data);
        console.log(users.users);
        
        var senderNumber = users.getUserNumber(socket.id);
        var receiverNumber = users.getUserNumber(data.id);
        
        if(!users.users[senderNumber].conversations[data.id]){
            users.users[senderNumber].conversations[data.id] = createMessageRightHTML(data.message);
        } else {
            users.users[senderNumber].conversations[data.id] += createMessageRightHTML(data.message);
        }
        if(!users.users[receiverNumber].conversations[socket.id]){
            users.users[receiverNumber].conversations[socket.id] = createMessageLeftHTML(data.message);
        } else {
            users.users[receiverNumber].conversations[socket.id] += createMessageLeftHTML(data.message);
        }
        
        console.log(users.users);
        socket.broadcast.to(`${data.id}`).emit('updateReceiverConversation', {conv: users.users[receiverNumber].conversations[socket.id], senderId: socket.id} );
        socket.emit('updateSenderConversation', users.users[senderNumber].conversations[data.id]);
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if(user){
            io.emit('updateUsersList', users.users);
        }
        console.log('user disconnected', socket.id);
        
    });

})


server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`); 
});