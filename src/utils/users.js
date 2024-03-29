const users = []

const addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: "Username and room are required"
        }
    }
    const exists = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (exists || username == 'system') {
        return {
            error: "Username already exists"
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) => {
    return match = users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return inRoom = users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
