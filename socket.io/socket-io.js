const socket_io = require('socket.io');
const io = socket_io();

let socketStuff = { io };

// io.on('connection', (socket) => {
//     console.log('New client connection');
// });

socketStuff.sendNewPostAlert = () => {
    io.sockets.emit('NewStoryPost', { msg: 'NewPost' });
}

module.exports = socketStuff;