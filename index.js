const express = require('express');
const app = express();
const config = require('./helpers/config');

app.use('/views', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

app.get('/',(req,res) => {
	// res.sendFile(__dirname + '/index.html');
	res.redirect('views/index.html');
});

var players = 0;
var passes = 0;
var wins =[
	{
		player: "",
		score: 0,
		total: 0
	},
	{
		player: "",
		score: 0,
		total: 0
	}
	];

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
	var crap = deck.splice(Math.floor((Math.random() * deck.length) + 1), 1);
	return crap;
	//return deck.splice(Math.floor((Math.random() * deck.length) + 1), 1);
}

function softResetGame() {
	wins[0].score = 0;
	wins[1].score = 0;

	hands = [];
	generateCardDeck();
	io.emit("handReset");
	io.emit("turnLock", false);
}

function resetGame() {
	wins = [
	{
		player: "",
		score: 0,
		total: 0
	},
	{
		player: "",
		score: 0,
		total: 0
	}
	];

	hands = [];
	generateCardDeck();
	io.emit("handReset");
	io.emit("turnLock", false);
}


const server = app.listen(config.port);
const io = require('socket.io').listen(server);

console.log("Sockets21 NodeJS Server is running...");

io.sockets.on('connection', function(socket) {
	players++;
	socket.emit("gameLog", "You joined the game");
	socket.broadcast.emit('gameLog', "Player joined");
	socket.emit("gameLog", "There are "+players+" connected players");
	resetGame();

	//Game stuff

	socket.on('playerDraws', (player) => {
		passes = 0;
		socket.broadcast.emit('gameLog', "Player "+player+" drew a card");
		var dcard = getRandomCard();
		hands.push({player: player, card: dcard});
		socket.emit("gameLog", "You drew a card");
		socket.broadcast.emit("enemyCardDrawn");
      	socket.emit("cardDrawn", JSON.stringify(dcard));
      	socket.emit("turnLock", true);
      	socket.broadcast.emit("turnLock", false);
	});

	socket.on('playerPasses', function(player) {
		passes++;
		socket.broadcast.emit('gameLog', "Player "+player+" passed");
		socket.emit("gameLog", "You passed");
		socket.emit("turnLock", true);
      	socket.broadcast.emit("turnLock", false);
      	if (passes == players) {
      		io.emit("handReset");
      		generateCardDeck();

      		console.log(hands);
      		for (var i in hands) {
      			if (hands[i].player != wins[0].player && hands[i].player != wins[1].player && wins[0].player == "") {
      				wins[0].player = hands[i].player;
      				wins[0].score += hands[i].card[0].value;
      			}
      			else if (hands[i].player != wins[0].player && hands[i].player != wins[1].player && wins[0].player != "") {
      				wins[1].player = hands[i].player;
      				wins[1].score += hands[i].card[0].value;
      			}
      			else if (hands[i].player == wins[0].player && hands[i].player != wins[1].player) {
      				wins[0].score += hands[i].card[0].value;
      			}
      			else if (hands[i].player != wins[0].player && hands[i].player == wins[1].player) {
      				wins[1].score += hands[i].card[0].value;
      			}
      		}

      		if (wins[0].score > wins[1].score && wins[0].score <= 21 || (wins[0].score < wins[1].score && wins[1].score >= 21)) {
      			io.emit("gameLog", wins[0].player+" wins this round with "+wins[0].score);
      			io.emit("gameLog", wins[1].player+" loses this round with "+wins[1].score);
      			wins[0].total++;
      		}
      		else if ((wins[0].score < wins[1].score && wins[1].score <= 21) || (wins[0].score > wins[1].score && wins[0].score >= 21)) {
      			io.emit("gameLog", wins[1].player+" wins this round with "+wins[1].score);
      			io.emit("gameLog", wins[0].player+" loses this round with "+wins[0].score);
      			wins[1].total++;
      		}
      		else {
      			io.emit("gameLog", "Nobody wins this round...");
      		}

      		if (wins[0].total == 3 || wins[1].total == 3) {
      			var winner = "";
      			if (wins[0].total > wins[1].total) {
      				winner = wins[0].player;
      			}
      			else {
      				winner = wins[1].player;
      			}
      			io.emit("gameOver", wins[0].player+": "+wins[0].total+" | "+wins[1].player+": "+wins[1].total+"\nThe winner is: "+winner);
      		}

      		console.log(wins);

      		softResetGame();

      		io.emit("gameStats", wins);
      		passes = 0;
      	}
	});

	socket.on('playerDisconnect', function(player) {
		players--;
		socket.broadcast.emit('gameLog', "Player "+player+" quit");
	});



});


  
