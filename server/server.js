const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const Shuffle = require('shuffle');

const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var deck;
var p1 = [], p2 = [];
var players = {};
var numPlayers = 0;
var currPlayer = 1;
var currRound = {};
var roundsLeft = 3;

app.use(express.static(publicPath));

function isTrue(curr) {
    return curr == true;
}

function objIsTrue(obj) {
    for (var key in obj) {
        if (!obj[key])
            return false;
    }
    return true;
}

function buildDeck() {
    var squidNigiri = {type: 'nigiri', name: 'squid', points: 3};
    var salmonNigiri = {type: 'nigiri', name: 'salmon', points: 2};
    var eggNigiri = {type: 'nigiri', name: 'egg', points: 1};
    var sushiGo = [];
    for (var i = 0; i < 20; i++) {
        if (i < 5)
            sushiGo.push(squidNigiri);
        else if (i < 15)
            sushiGo.push(salmonNigiri);
        else
            sushiGo.push(eggNigiri);
    }

    deck = Shuffle.shuffle({deck: sushiGo});
    console.log(deck);

    var hands = [];
    for (var id in players) {
        hands.push(players[id].deck);
    }
    deck.deal(3, hands);
    for (var id in players) {
        console.log(id, ' deck: ', players[id].deck);
    }
}

io.on('connection', (socket) => {
    console.log('new user' + numPlayers);

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to Sushi Go!'));

    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New player joined'));

    players[socket.id] = {
        socket,
        deck: [],
        score: 0
    };
    currRound[socket.id] = false;
    numPlayers++;

    if (numPlayers == 2) {
        buildDeck();
        io.emit('newMessage', generateMessage('Admin', 'GAME STARTED'));
        
        for (var id in players) {
            players[id].socket.emit('newMessage', generateMessage('YOUR CARDS', JSON.stringify(players[id].deck)));
        }
    }

    socket.on('createMessage', (message, callback) => {
        console.log('createMessage', message);
        // socket.emit('newMessage', generateMessage(message.from, message.text));
        socket.emit('newMessage', generateMessage('YOU CHOSE', message.text));
        callback('This is from the server.');

        var choice = parseInt(message.text, 10);
        if (choice >= players[socket.id].deck.length) {
            socket.emit('newMessage', generateMessage('Admin', 'Invalid choice. Choose again'));
        }
        else {
            players[socket.id].score += players[socket.id].deck[choice].points;
            players[socket.id].deck.splice(choice, 1);
            currRound[socket.id] = true;
            
            console.log(currRound);
            if (!objIsTrue(currRound)) {
                socket.emit('newMessage', generateMessage('Admin', 'Waiting for players...'));
            }
        }

        if (objIsTrue(currRound)) {
            roundsLeft--;
            io.emit('newMessage', generateMessage('Admin', `ROUND ${3 - roundsLeft} OVER`));

            for (var id in players) {
                io.emit('newMessage', generateMessage(id, players[id].score));
            }

            if (roundsLeft == 0) {
                io.emit('newMessage', generateMessage('Admin', 'GAME OVER'));
            }
            else {
                io.emit('newMessage', generateMessage('Admin', `ROUND ${3 - roundsLeft + 1} BEGINS`));
                for (var id in players) {
                    players[id].socket.emit('newMessage', generateMessage('YOUR CARDS', JSON.stringify(players[id].deck)));
                }
                for (var id in currRound) {
                    currRound[id] = false;
                }
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        numPlayers--;
    })
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});