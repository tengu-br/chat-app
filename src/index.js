const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    // console.log('New websocket connection detected!')

    socket.on('join', ({ username, room }, ackCallback) => {

        const id = socket.id
        const { error, user } = addUser({ id, username, room })

        if (error) {
            return ackCallback(error)
        }

        socket.join(room)
        socket.emit('message', generateMessage('Welcome!', 'System'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'System'))
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        ackCallback()
    })

    socket.on('sendMessage', (message, ackCallback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return ackCallback('You prude!')
        }

        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(message, user.username))
        ackCallback()
    })

    socket.on('sendLocation', ({ lat, lon }, ackCallback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${lat},${lon}`, user.username))
        // ackCallback(generateLocationMessage(`https://google.com/maps?q=${lat},${lon}`))
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`))
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        }
    })

})

server.listen(port, () => {
    // console.log('server\'s fired up')
})
