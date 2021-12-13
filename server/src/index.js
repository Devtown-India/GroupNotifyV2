import express from 'express'
import cors from 'cors'
import http from 'http'
import socketIO from 'socket.io';
import { Client } from 'whatsapp-web.js';
import queue from './queue'
import multer from 'multer'
import path from 'path'

var client

const app = express()
const server = http.createServer(app)

// Queue and their workers


queue.empty()
// queue.add({});
// queue.add({});
// queue.add({});

const io = socketIO(server, {
    cors: {
        cors: {
            origin: "http://localhost:3001"
        }
    }
})

io.on('connection', (socket) => {
    console.log('A user is connected');

    socket.on('message', (message) => {
        console.log(`message from ${socket.id} : ${message}`);
    })

    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);
    })
})

export { io };


app.use(express.json())
app.use(cors())
app.use(express.static('public'));


// FILE UPLOAD
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(path.join(path.resolve(), '/public'))
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage }).array('file')

app.post('/upload', function (req, res) {
    upload(req, res, function (err) {

        if (err instanceof multer.MulterError) {
            console.log(err)

            return res.status(500).json(err)
            // A Multer error occurred when uploading.
        } else if (err) {
            console.log(err)

            return res.status(500).json(err)
            // An unknown error occurred when uploading.
        }
        return res.status(200).json({
            message: "File saved successfully"
        })
        // Everything went fine.
    })
});


export { client }

let chats = null


app.post('/initializeClient', (req, res) => {
    const { session } = req.body
    if (session) {
        client = new Client({ puppeteer: { 'headless': true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', timeout: 1000000, }, session });
    } else {
        client = new Client();
    }

    client.on('qr', qr => {
        console.log("new QR generated")
        io.emit('qr', { qr })
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        io.emit('client-ready', {})
    });

    client.on('disconnected', (reason) => {
        console.log('Client was disconnected!', reason);
        io.emit('client-disconnected', { reason })
    });

    client.on('auth_failure', (message) => {
        console.log('Auth Failure!', message);
        io.emit('auth-failure', { message })
    });

    client.on('authenticated', (session) => {
        io.emit('authenticated', { session })
    });

    client.initialize();
    chats = null
    res.send('initliased client')
})

app.get('/testClient', (req, res) => {
    console.log(client)
    res.send('Check server for client')
})

app.get('/logout', (req, res) => {

    io.emit('ping', { ping: "This is a ping request" })
    client.logout()
    res.send('logout success')

})

app.get('/status', (req, res) => {

    console.log(client)

})

app.get('/destroy', async (req, res) => {
    await client.destroy()
    chats = null

    console.log('destroying client')
    res.json({ message: "Client destroyed" })

})


// const updateChats = async () => {
//     chats = client.getChats()
// }

app.get('/getGroups', async (req, res) => {
    // if (initialized) {
    try {

        if (chats == null) chats = await client.getChats()
        const groupChats = chats.filter(chat => chat.isGroup)
        res.json({ status: 'success', groupChats })

    } catch (error) {
        console.log(error)
        res.json({
            status: 'failed',
            message: "Failed to load chats"
        })
    }
});


app.post('/sendMessage', async (req, res) => {

    const { groups = [], message, isFile, fileName = null } = req.body
    groups.forEach((group, iteration) => {
        console.log({ isFile, fileName, message, chatId: group })
        queue.add({ iteration: iteration + 1, isFile, fileName, message, chatId: group })
    })

    res.json({ message: "Messages queued " })
    // updateChats()

})



app.get('/getChats', async (req, res) => {

    try {
        // // console.log(allChats)
        // const allChats = await client.getChats()

        // // const groupChats = allChats.filter(chat => chat.isGroup)
        // // res.json({ status: 'success', groupChats })
        // // console.log(allChats)
        // // console.log('-------------')
        const c = chats.filter(chat => (chat.isGroup == false && chat.unreadCount > 0))
        let messages = []
        // // // // for (let i = 0; i < chats.length; i++) {
        // // // //     const msgs = await chats[i].fetchMessages({ limit: 10 })
        // // // //     const message = msgs[9]
        // // // // if (message && message.timestamp > (Date.now() / 1000 - (1209600)) && message.ack === 0) {
        // // // //         if (message) message.ack === 0 && message.fromMe === false ? messages.push({ chat: chats[i], messages: msgs }) : null
        // // // //     } else break
        // // // // }
        // // console.log(chats)
        // // console.log('-------------')
        for (let i = 0; i < (c.length > 20 ? 20 : c.length); i++) {
            const chat = c[i]
            const msgs = await chat.fetchMessages({ limit: 10 })
            const message = msgs[msgs.length - 1]
            if (message && message.timestamp > (Date.now() / 1000 - (604800))) {
                messages.push({ chat, messages: msgs })
            }

        }
        res.json({ messages })


    } catch (error) {
        console.log(error)
        res.json({ error: error.message })

    }

})


server.listen(8080, () => {
    console.log(`Server up and running on port 8080`);
})