const { status } = require('./status');

const { v4: uuid } = require('uuid');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

/**
 * yarn prod 情况下开启注释内容
 */
app.use('/', express.static(path.resolve(__dirname, '../dist')));

io.of('/chat').on('connection', socket => {
  const { id, name } = socket.handshake.query;
  const user = { id, name };
  console.log(`user ${user.name} connected`);
  status.onlineUserList = [...status.onlineUserList, user];
  socket.emit('enter', status);

  socket.on('enter', data => {
    const newOnlineUserList = status.onlineUserList.filter(n => n.id !== user.id);
    newOnlineUserList.push(user);
    status.onlineUserList = newOnlineUserList;
    socket.emit('enter', { ...status, onlineUserList: newOnlineUserList });
    socket.broadcast.emit('enter', { ...status, onlineUserList: newOnlineUserList });
  });

  socket.on('chat message', msg => {
    const newMsgList = [
      ...status.msgList,
      { id: uuid(), userName: user.name, userId: user.id, text: msg },
    ];
    status.msgList = newMsgList;
    socket.emit('chat message', { msgList: newMsgList });
    socket.broadcast.emit('chat message', { msgList: newMsgList });
  });

  socket.on('disconnect', () => {
    const newOnlineUserList = status.onlineUserList.filter(n => n.id !== user.id);
    status.onlineUserList = newOnlineUserList;
    console.log(`user ${user.name} disconnected`);
    socket.emit('leave', { onlineUserList: newOnlineUserList });
    socket.broadcast.emit('leave', { onlineUserList: newOnlineUserList });
  });
});

server.listen(3000, () => {
  console.log('server is listening on \x1B[32m\x1B[4mhttp://localhost:3000\033[0m');
  console.log(`                       \x1B[32m\x1B[4mhttp://${getIPAdress()}:3000\n`);
  console.log('\033[0m');
});

// 获取本机电脑IP
function getIPAdress() {
  let interfaces = require('os').networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
}
