const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let gameState = {
  buttons: Array(18).fill().map(() => ({ color: '#ccc', houses: 0 }))
};

io.on('connection', (socket) => {
  console.log('A user connected');

  // 發送當前游戲狀態給新連接的客戶端
  socket.emit('initialState', gameState);

  // 處理按鈕更新
  socket.on('updateButton', (data) => {
    const { index, color, houses } = data;
    gameState.buttons[index] = { color, houses };
    
    // 廣播更新給所有客戶端
    io.emit('buttonUpdated', { index, color, houses });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
