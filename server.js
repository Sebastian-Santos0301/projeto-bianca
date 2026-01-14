const express = require('express');
const path = require('path'); // Essa é a bússola do servidor
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

// Configuração blindada: Diz pro servidor exatamente onde está a pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Garantia extra: Se alguém acessar a raiz, entrega o arquivo do jogo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let jogadores = {};

io.on('connection', (socket) => {
    console.log('Novo piloto conectado:', socket.id);

    jogadores[socket.id] = {
        id: socket.id,
        cor: '#' + Math.floor(Math.random()*16777215).toString(16),
        pontuacao: 0
    };

    socket.emit('setupJogador', jogadores[socket.id]);
    
    io.emit('atualizarLista', jogadores);

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