const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.emit('initialData', gameState);

  socket.on('update', (data) => {
    const { team, type, amount } = data;
    const teamData = gameState.teams.find(t => t.team === team);
    if (teamData) {
      teamData[type === '現金' ? 'cash' : 'virtualCurrency'] = parseFloat(amount);
    }
    io.emit('update', data);
  });

  socket.on('updateVirtualCurrencyValue', (newValue) => {
    gameState.virtualCurrencyValue = parseFloat(newValue);
    io.emit('updateVirtualCurrencyValue', newValue);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const listener = http.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
