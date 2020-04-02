var socket = io();

var defaultSheet = "default.css";
var darkSheet = "dark.css";
var styleIsDefault = true;
var emojiBoxIsOpen = false;

var sendTo = '';

const sendIcon = document.getElementById('sendIcon');
const messageInput = document.getElementById('messageInput');
const chatCardBody = document.getElementById('chatCardBody');
const users = document.getElementById('users');
const chatCard = document.getElementsByClassName('chatCard');

/***  changing Style (DarkTheme or DefaultTheme) ***/
function changeStyle() {
    if (styleIsDefault === true) {
        document.getElementById("pageStyle").setAttribute("href", darkSheet);
    } else {
        document.getElementById("pageStyle").setAttribute("href", defaultSheet);
    }

    styleIsDefault = !styleIsDefault;
}
/*** ------------------------------------------------- ***/


function createMessageRightHTML(messageContent) {
    return `<div class="message-right-container">
                <div class="message-right">
                    <p> ${messageContent} </p>
                </div>
            </div>`;
}
function createMessageLeftHTML(messageContent) {
    return `<div class="message-left-container">
                <img src="./icons/blue Icons/user.png" alt="" style="width: 90%; margin-top: 10px;">
                <div class="message-left">
                    <p> ${messageContent} </p>
                </div>
            </div>`
}

function search() {
    // Declare variables
    var input, filter, ul, li, name, i, txtValue;
    input = document.getElementById('searchInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("users");
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        name = li[i].getElementsByTagName("div")[1].getElementsByTagName('h6')[0];
        txtValue = name.innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function showEmojiBox() {
    if (!emojiBoxIsOpen) {
        document.getElementById('emojiBox').style.display = "flex";
    } else {
        document.getElementById('emojiBox').style.display = 'none';
    }
    emojiBoxIsOpen = !emojiBoxIsOpen;
}
function addEmoji(emoji) {
    console.log(emoji);
    document.getElementById('messageInput').value += emoji;
}

function logOut() {
    location.href = "/";
}

function displayMessage(conversation) {
    if (conversation) {
        chatCardBody.innerHTML = conversation;
    } else {
        chatCardBody.innerHTML = '';
    }
}

function getUserInfo(id) {
    socket.emit('getUserInfo', id);
    document.getElementById(id).style.backgroundColor = 'transparent';
}


messageInput.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("sendIcon").click();
    }
});
sendIcon.addEventListener("click", function () {
    if (sendTo) {
        socket.emit('sendMessage', { id: sendTo, message: messageInput.value });
    } else {
        console.log('error');
    }
    messageInput.value = '';
});

socket.on('updateSenderConversation', function (conversation) {
    displayMessage(conversation);
});

socket.on('updateReceiverConversation', function (data) {
    console.log('received message', data);
    console.log('test ----', data.senderId, '----', sendTo);

    if (sendTo === data.senderId) {
        displayMessage(data.conv);
    } else {
        console.log('else bloc');

        document.getElementById(data.senderId).style.backgroundColor = '#cff2cb';
    }
});

socket.on('connect', function () {
    console.log('Connected to Server', socket.id);
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params);
});


socket.on('updateUsersList', function (usersList) {
    console.log(usersList);
    var params = jQuery.deparam(window.location.search);
    currentUserName = params.firstName + ' ' + params.lastName;
    var usersListHTML = '';
    usersList = usersList.filter((user) => user.name !== currentUserName);
    usersList.forEach(function (user) {
        usersListHTML += '<li onclick="getUserInfo(this.id)" id="' + user.id + '" class="onlineUsersListItem"><div class="onlineUserImage-container"><img class="onlineUserImage" src="./icons/blue Icons/user (1).png" alt=""></div><div class="onlineUserName-container"><h6  class="onlineUserName">';
        usersListHTML += user.name + '</h6></div></li>'
    })
    users.innerHTML = usersListHTML;
});

socket.on('sendingUserInfo', function (usersData) {
    console.log(usersData);
    document.getElementById('chatting-userName').innerHTML = usersData.receiver.name;
    document.getElementById('welcomeCard').style.display = 'none';
    document.getElementById('chatCard').style.display = 'grid';

    sendTo = usersData.receiver.id;
    if (usersData.sender.conversations[sendTo]) {
        chatCardBody.innerHTML = usersData.sender.conversations[sendTo];
    } else {
        chatCardBody.innerHTML = '';
    }
});

function notWorking() {
    alert('We are Sorry. we are still working on this feature.');
}