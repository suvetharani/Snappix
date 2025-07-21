require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use("/uploads", express.static("uploads"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connect
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io logic
const onlineUsers = {};
io.on('connection', (socket) => {
  socket.on('register', (username) => {
    onlineUsers[username] = socket.id;
  });

  socket.on('send_message', (data) => {
    if (onlineUsers[data.receiver]) {
      io.to(onlineUsers[data.receiver]).emit('receive_message', data);
    }
  });

  socket.on('message_read', ({ sender, receiver }) => {
    if (onlineUsers[sender]) {
      io.to(onlineUsers[sender]).emit('message_read_ack', { from: receiver });
    }
  });

  socket.on('disconnect', () => {
    for (const [user, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) {
        delete onlineUsers[user];
        break;
      }
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
