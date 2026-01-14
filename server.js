const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.static('public'));

let jogadores = {};

io.on('connection', (socket) => {
    console.log('Novo piloto:', socket.id);
    jogadores[socket.id] = { id: socket.id, cor: '#'+Math.floor(Math.random()*16777215).toString(16), pontuacao: 0 };
    socket.emit('setupJogador', jogadores[socket.id]);
    io.emit('atualizarLista', jogadores);
    socket.on('disconnect', () => { delete jogadores[socket.id]; io.emit('atualizarLista', jogadores); });
});

http.listen(process.env.PORT || 3000, () => console.log('Servidor ON'));