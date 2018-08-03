//Client JS for Sockets21

function $(id) {
    return document.getElementById(id);
}

var deckdraw_allowed = true;

//Game events
let socket = io('http://localhost:3000');

socket.on('playerJoined', () => {
    console.log("Player joined");
});

socket.on('playerDisconnect', (player) => {
    console.log("Player disconnected");
});

socket.on("gameLog", (msg) => {
    console.log(msg);
    $("gameLog").innerHTML += "<p>"+msg+"</p>";
    $("gameLog").scrollTop = $("gameLog").scrollHeight;
});

socket.on("cardDrawn", (dcard) => {
    var card = JSON.parse(dcard)[0];
    console.log(card);
    var cardimg = document.createElement("img");
    cardimg.src = "images/cards/"+card.value+card.suit+".png";
    cardimg.style = "width: 10%; height: 10%; margin-top: 5px; margin-left: 5px; margin-right: 5px; border-style: solid; border-width: 2px;";
    $("playerhand").appendChild(cardimg);
});

socket.on("enemyCardDrawn", () => {
    var enemycard = document.createElement("img");
    enemycard.src = "images/cards/Back.png";
    enemycard.style = "width: 10%; height: 10%; margin-top: 5px; margin-left: 5px; margin-right: 5px; border-style: solid; border-width: 2px;";
    $("enemyhand").appendChild(enemycard);
});

socket.on("gameStats", (wins) => {
    console.log(wins);
});

socket.on("turnLock", (status) => {
    console.log(status);
    $("drawbtn").disabled = status;
    $("passbtn").disabled = status;
    deckdraw_allowed = !status;
});

socket.on("handReset", () => {
    handReset();
});

socket.on("gameOver", (msg) => {
    alert(msg);
    handReset();
    scoreReset();
});

//Some game functions
function renderDeck() {
    for (var i = 1; i <= 10; i++) {
        var deckcard = document.createElement("img");
        deckcard.src = "images/cards/Back.png";
        deckcard.style = "border-style: solid; border-width: 1px; transform: rotate(90deg); margin-left: 50%; margin-top: 30%; width: 10%; height: 10%; position: absolute; top: "+(i*5)+"px; left: "+(-i*5)+"px; z-index: "+i+"px;";
        $("deck").appendChild(deckcard);
    }
}

function drawFromDeck() {
    if (deckdraw_allowed) {
        drawCard();
    }
}

function drawCard() { 
    socket.emit('playerDraws', $('player').value.trim()===''? '2' :$('player').value);
}

function pass() {
    socket.emit('playerPasses', $('player').value.trim()===''? '2' :$('player').value);
}

function clearLog() {
    while ($("gameLog").firstChild) {
        $("gameLog").removeChild($("gameLog").firstChild);
    }
}

function setPlayer() {
    $("player").disabled = true;
}

function handReset() {
    while ($("playerhand").firstChild) {
        $("playerhand").removeChild($("playerhand").firstChild);
    }
    while ($("enemyhand").firstChild) {
        $("enemyhand").removeChild($("enemyhand").firstChild);
    }
}

function scoreReset() {
    $("wins").innerHTML = "";
}


//Closing the window or reloading counts as a player disconnect
window.onunload = () => {
    socket.emit('playerDisconnect', $('player').value.trim()===''? '2' :$('player').value);
    //socket.emit('playerDisconnect', $('player').value);
}

window.onbeforeunload = () => {
    socket.emit('playerDisconnect', $('player').value.trim()===''? '2' :$('player').value);
    //socket.emit('playerDisconnect', $('player').value);
}