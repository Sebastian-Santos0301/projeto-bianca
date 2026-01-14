const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

let jogadores = {};

io.on('connection', (socket) => {
    console.log('Novo piloto conectado:', socket.id);

    jogadores[socket.id] = {
        id: socket.id,
        cor: '#' + Math.floor(Math.random()*16777215).toString(16),
        pontuacao: 0
    };

    socket.emit('setupJogador', jogadores[socket.id]);
    
    // Atualiza lista para todos
    io.emit('atualizarLista', jogadores);

    // Recebe atualizações de pontuação (distância)
    socket.on('atualizarScore', (score) => {
        if(jogadores[socket.id]) {
            jogadores[socket.id].pontuacao = score;
        }
    });

    socket.on('disconnect', () => {
        console.log('Piloto saiu:', socket.id);
        delete jogadores[socket.id];
        io.emit('atualizarLista', jogadores);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Motor ligado na porta ${PORT}`);
});