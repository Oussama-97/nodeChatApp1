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
var usernamesList = [];

app.use(express.static(path.join(__dirname, 'public')));

function createMessageRightHTML (messageContent) {    
    return `<div class="message-right-container">
                <div class="message-right">
                    <p style="word-break: break-all;"> ${messageContent} </p>
                </div>
            </div>`;
}
function createMessageLeftHTML (messageContent) {
    return `<div class="message-left-container">
                <img src="./icons/blue Icons/user.png" alt="" style="width: 90%; margin-top: 10px;">
                <div class="message-left">
                    <p style="word-break: break-all;"> ${messageContent} </p>
                </div>
            </div>`
}


io.on('connect', (socket) => {
    socket.on('getusernames', () => {
        socket.emit('usernames', usernamesList);
    });

    socket.on('join', (data) => {
            socket.join(data.userName);
            usernamesList.push(data.userName);
            users.addUser(data.userName, data.name);
            io.emit('updateUsersList', users.usersObj);
    });

    socket.on('getUserInfo', (data) => {
        socket.emit('sendingUserInfo', {receiver: users.getUser(data.receiver), sender: users.getUser(data.sender)});
    });

    socket.on('sendMessage', (data) => {
        users.addMsgToConversation(data.sender, data.receiver, createMessageRightHTML(data.message) );
        users.addMsgToConversation(data.receiver, data.sender, createMessageLeftHTML(data.message) );
    
        socket.broadcast.to(data.receiver).emit('updateReceiverConversation', {conv: users.usersObj[data.receiver].conversations[data.sender], sender: data.sender} );
        socket.emit('updateSenderConversation', users.usersObj[data.sender].conversations[data.receiver]);
    });

    socket.on('logOut', (userName) => {
        socket.disconnect();
        var user = users.removeUser(userName);
        if(user){
            usernamesList.pop(userName);
            
            io.emit('updateUsersList', users.usersObj);
        }
    });

})


server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`); 
});