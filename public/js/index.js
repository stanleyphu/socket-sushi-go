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