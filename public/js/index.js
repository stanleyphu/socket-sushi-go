var socket = io();

socket.on('connect', function () {
    console.log('Connected to server');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function(message) {
    console.log('New message', message);
    var li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`);

    jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    
    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val() 
    }, function () {
        jQuery('[name=message]').val('') 
    });
});

jQuery('#nickname-input').on('change', function (e) {
    e.preventDefault();
    
    socket.emit('changeName', {
        name: jQuery('[name=nickname]').val() 
    }, function () {
        jQuery('[name=nickname]').val('') 
    });
});

var joinGameButton = jQuery('#join-game');
joinGameButton.on('click', function (e) {
    socket.emit('joinGame');
});

var startGameButton = jQuery('#start-game');
startGameButton.on('click', function (e) {
    socket.emit('startGame');
});

var numPlayersField = jQuery('#num-players');
numPlayersField.on('change', function (e) {
    e.preventDefault();

    socket.emit('changeNumPlayers', {
        players: jQuery('[name=numPlayers]').val()
    });
});

socket.on('newNumPlayers', function (obj) {
    numPlayersField.val(obj.players);
});

socket.on('newUsersJoined', function (obj) {
    jQuery('#users-joined').text(obj.usersJoined);
});

socket.on('newPlayersStarted', function (obj) {
    jQuery('#players-started').text(obj.playersStarted);
})