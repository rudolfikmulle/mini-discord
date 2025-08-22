// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Історія повідомлень
let messages = [];

io.on('connection', (socket) => {
  console.log('Користувач підключився');

  // Надсилаємо новому клієнту історію
  socket.emit('history', messages);

  // Текстові повідомлення
  socket.on('message', (msg) => {
    const data = {
      type: 'text',
      from: socket.username || 'Анонім',
      text: msg,
      at: Date.now()
    };
    messages.push(data);
    if (messages.length > 100) messages.shift(); // обмежуємо історію
    io.emit('message', data);
  });

  // Фото
  socket.on('image', (imgData) => {
    const data = {
      type: 'image',
      from: socket.username || 'Анонім',
      src: imgData, // base64
      at: Date.now()
    };
    messages.push(data);
    if (messages.length > 100) messages.shift();
    io.emit('message', data);
  });

  // Коли юзер вказує ім'я
  socket.on('setName', (name) => {
    socket.username = name;
    console.log(`Користувач встановив ім'я: ${name}`);
  });

  socket.on('disconnect', () => {
    console.log('Користувач відключився');
  });
});

server.listen(3000, () => {
  console.log('Сервер працює на http://localhost:3000');
});
