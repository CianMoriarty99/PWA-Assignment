const socket_io = require('socket.io');
const io = socket_io();

let socketStuff = {};

socketStuff.io = io;

io.on('connection', function(socket){
    console.log('New client connection');
});

socketStuff.sendNewPostAlert = function() {
    io.sockets.emit('NewStoryPost', {msg: 'NewPost'});
}

module.exports = socketStuff;