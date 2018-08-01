const express = require('express');
const app = express();
const config = require('./helpers/config');

app.use('/views', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

app.get('/',(req,res)=>{
	// res.sendFile(__dirname + '/index.html');
	res.redirect('views/index.html');
});

var players;

//An array of player names and drawn cards Good enough to build "hands".
var hands = [];

//Defining a card deck and a way to get a random card.
var deck = [];

function generateCardDeck() {
	for (var i = 0; i < 13; i++) {
		for (var j = 0; j < 4; j++) {
			if (j == 0) {
				deck.push({value: i+1, suit: "Spades"});
			}
			else if (j == 1) {
				deck.push({value: i+1, suit: "Hearts"});
			}
			else if (j == 2) {
				deck.push({value: i+1, suit: "Diamonds"});
			}
			else {
				deck.push({value: i+1, suit: "Clubs"});
			}
		}		
	}
}

function getRandomCard() {
	//return deck.splice(Math.floor((Math.random() * 52) + 1), 1);
	return deck.splice(Math.floor((Math.random() * deck.length) + 1), 1);
}


generateCardDeck();

const server = app.listen(config.port);
const io = require('socket.io').listen(server);

console.log("Sockets21 NodeJS Server is running...");

io.sockets.on('connection', function(socket) {

	io.clients((error, clients) => {
		if (error) {
			console.log(error);
		}
		players = clients;
	});
	socket.broadcast.emit('gameLog', "Player joined");

	//Game stuff

	socket.on('playerDraws', function(player) {
		socket.broadcast.emit('gameLog', "Player "+player+" drew a card");
		var card = getRandomCard();
		hands.push({player: player, card: card});
		console.log("Player "+player+" drawed: "+card);
      	socket.emit('gameLog', card);
   	
	});

	socket.on('playerPasses', function(player) {
		socket.broadcast.emit('gameLog', "Player "+player+" passed");
	});

	socket.on("showCards", function() {

	});

	socket.on('playerDisconnect', function(player) {
		socket.broadcast.emit('gameLog', "Player quit");
	});



});


  
