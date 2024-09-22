const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 存儲遊戲狀態
let gameState = {
    buttons: Array(18).fill().map(() => ({ color: '#ccc', houses: 0 }))
};

io.on('connection', (socket) => {
    console.log('A user connected');

    // 發送初始數據給新連接的客戶端
    socket.emit('initialState', gameState);

    // 處理更新請求
    socket.on('updateButton', (data) => {
        const { index, color, houses } = data;
        if (index >= 0 && index < gameState.buttons.length) {
            gameState.buttons[index] = { color, houses };
            // 廣播更新給所有客戶端
            io.emit('updateButton', data);
        }
    });

    // 處理請求初始數據
    socket.on('requestInitialState', () => {
        socket.emit('initialState', gameState);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
