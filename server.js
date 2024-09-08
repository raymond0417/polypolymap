const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 設置靜態文件夾
app.use(express.static(path.join(__dirname, 'public')));

let gameState = {
  teams: [
    { team: '第一小隊', cash: 0, virtualCurrency: 0 },
    { team: '第二小隊', cash: 0, virtualCurrency: 0 },
    { team: '第三小隊', cash: 0, virtualCurrency: 0 },
    { team: '第四小隊', cash: 0, virtualCurrency: 0 },
    { team: '第五小隊', cash: 0, virtualCurrency: 0 },
    { team: '第六小隊', cash: 0, virtualCurrency: 0 }
  ],
  virtualCurrencyValue: 0
};

io.on('connection', (socket) => {
  console.log('A user connected');

  // 發送初始數據給新連接的客戶端
  socket.emit('initialData', gameState);

  // 處理更新請求
  socket.on('update', (data) => {
    const { team, type, amount } = data;
    const teamData = gameState.teams.find(t => t.team === team);
    if (teamData) {
      teamData[type === '現金' ? 'cash' : 'virtualCurrency'] = parseFloat(amount);
    }
    // 廣播更新給所有客戶端
    io.emit('update', data);
  });

  // 處理虛擬貨幣價值更新
  socket.on('updateVirtualCurrencyValue', (newValue) => {
    gameState.virtualCurrencyValue = parseFloat(newValue);
    // 廣播更新給所有客戶端
    io.emit('updateVirtualCurrencyValue', newValue);
  });

  // 處理請求初始數據
  socket.on('requestInitialData', () => {
    socket.emit('initialData', gameState);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
