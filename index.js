const express = require('express')
const socketio = require('socket.io')
const http = require ('http')

const PORT = process.env.PORT || 5000

const router = require('./router')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
app.use(router)

io.on('connect', (socket) => {
    // console.log('new connection!')
    
    socket.on('join', ({name, room}, callback) => {
        const { error, user} = addUser({id: socket.id, name, room})

        if(error) callback(error)
        console.log(user)
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined`})
        socket.join(user.room)

        callback()
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message:', {user:user.name, text: message})
        callback()
    });
    socket.on('disconnect', () => {
        console.log('user left')
    });
});


server.listen(PORT, () => console.log(`server has started on port ${PORT}`))
