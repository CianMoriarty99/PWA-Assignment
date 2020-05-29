const socketIo = require('socket.io');
const io = socketIo();

let socketStuff = { io };

socketStuff.sendNewPostAlert = () => {
    io.sockets.emit('NewStoryPost', { msg: 'NewPost' });
}

module.exports = socketStuff;