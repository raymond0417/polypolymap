const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// 文件路径用于保存游戏状态
const GAME_STATE_FILE = path.join(__dirname, 'gameState.json');

// 检查并确保 gameState.json 文件存在且可写入
function ensureGameStateFile() {
  try {
    if (!fs.existsSync(GAME_STATE_FILE)) {
      console.log('gameState.json does not exist. Creating it...');
      const initialState = {
        buttons: Array(28).fill().map(() => ({ color: '#ccc', houses: 0 }))
      };
      fs.writeFileSync(GAME_STATE_FILE, JSON.stringify(initialState), 'utf8');
      console.log('gameState.json created successfully.');
    }

    // 检查文件是否可写
    fs.accessSync(GAME_STATE_FILE, fs.constants.W_OK);
    console.log('gameState.json is writable.');
  } catch (err) {
    console.error('Error with gameState.json:', err);
    process.exit(1); // 如果出现错误，终止程序
  }
}

// 加载游戏状态
function loadGameState() {
  try {
    const data = fs.readFileSync(GAME_STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading game state file:", err);
    return {
      buttons: Array(28).fill().map(() => ({ color: '#ccc', houses: 0 }))
    };
  }
}

function saveGameState(gameState) {
  try {
    fs.writeFileSync(GAME_STATE_FILE, JSON.stringify(gameState), 'utf8');
    console.log("Game state saved successfully");
  } catch (err) {
    console.error("Error writing game state file:", err);
  }
}

// 确保 gameState.json 文件存在且可写
ensureGameStateFile();

// 加载游戏状态
let gameState = loadGameState();

io.on('connection', (socket) => {
  console.log('A user connected');

  // 发送初始数据给新连接的客户端
  socket.emit('initialState', gameState);

  // 处理更新请求
  socket.on('updateButton', (data) => {
    console.log('Received update:', data);
    const { index, color, houses } = data;
    if (index >= 0 && index < gameState.buttons.length) {
      gameState.buttons[index] = { color, houses };
      // 广播更新给所有客户端
      io.emit('updateButton', data);
      // 保存游戏状态
      saveGameState(gameState);
    } else {
      console.error('Invalid button index:', index);
    }
  });

  // 处理请求初始数据
  socket.on('requestInitialState', () => {
    console.log('Initial state requested');
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
