const socket = io()

//Templates
const msgTemplate = document.querySelector('#messageTemplate').innerHTML
const positionTemplate = document.querySelector('#locationTemplate').innerHTML
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML


const autoScroll = () => {
    const $newMessage = messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = messages.offsetHeight
    const containerHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + visibleHeight

    // checks if youre at the bottom
    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
    
}

socket.on('message', (txt) => {
    console.log(txt.text)
    const html = Mustache.render(msgTemplate, { messageMustache: txt.text, createdAt: moment(txt.createdAt).format('hh:mm A'), username: txt.username })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
});

socket.on('locationMessage', (txt) => {
    console.log(txt.text)
    const html = Mustache.render(positionTemplate, { locationMustache: txt.url, createdAt: moment(txt.createdAt).format('hh:mm A'), username: txt.username })
    messages.insertAdjacentHTML('beforeend', html)
    console.log('Location shared.')
    autoScroll()
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room: room, users: users })
    sidebar.innerHTML = html
})

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

msgForm.addEventListener('submit', (e) => {

    e.preventDefault()
    msgButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', e.target.elements.msg.value, (reply) => {
        msgButton.removeAttribute('disabled')
        msg.value = ''
        msg.focus()
        if (reply) {
            return console.log(reply)
        }
        console.log('Message delivered.')
    })
})

locationButton.addEventListener('click', (e) => {

    if (!navigator.geolocation) {
        return alert('Browser does not support geolocation features.')
    }

    locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        locationButton.removeAttribute('disabled')
        socket.emit('sendLocation', {
            'lat': position.coords.latitude,
            'lon': position.coords.longitude
        }, (reply) => {

        })
    })


})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})