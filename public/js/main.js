//Client JS for Sockets21

let socket = io('http://localhost:3000');

function $(id) {
    return document.getElementById(id);
}


function joinGame() {
    let socket = io('http://localhost:3000');

    socket.on('playerJoined', () => {
        console.log("Player joined");
    });

    socket.on('playerDisconnect', (player) => {
        console.log("Player disconnected");
    });

    socket.on("gameLog", (msg) => {
        console.log(msg);
    });

}

function drawCard() { 
    socket.emit('playerDraws', $("user").value);
}

function pass() {
    socket.emit('playerPasses', $("user").value);
}


//Closing the window counts as a player disconnect
window.onunload = () => {
    //socket.emit('playerDisconnect', $('user').value.trim()===''? 'Anonimo' :$('user').value);
    socket.emit('playerDisconnect', $('user').value);
}