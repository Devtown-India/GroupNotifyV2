import Queue from 'bull'
const Redis = require("ioredis");
import { io, client } from './index'
import { MessageMedia } from 'whatsapp-web.js';
import path from 'path'



let redis

// try {
//     redis = new Redis({
//         port: 14315,
//         host: "redis-14315.c10.us-east-1-2.ec2.cloud.redislabs.com",
//         password: "UhDPm0Gsqc7r6dluEeCulIts1IjeBBfu",
//     })
//     console.log(redis)
// } catch (error) {
//     console.log(error)
// }


function getRandomInt(isFile) {
    const min = isFile ? 1000 : 3000
    const max = isFile ? 4000 : 8000
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



const queue = new Queue('message-queue', {
    limiter: {
        max: 11,
        duration: 1000,
    },
});

queue.process(async (job, done) => {
    console.log(job.data)
    const { isFile, fileName, message, chatId, iteration } = job.data
    await setTimeout(async () => {

        try {
            const group = await client.getChatById(chatId)
            if (isFile) {
                const file = await MessageMedia.fromFilePath(path.join(path.resolve(), `/public/${fileName}`))
                await group.sendMessage(file, { caption: message || '' })
            } else {
                await group.sendMessage(message)
            }
            done(null, { message: `Message - ${iteration} : Mesage sent to ${group.name}` })
        } catch (error) {
            console.log(error.message)
            done({ error: error.message })

        }

    }, getRandomInt(isFile))
})

queue.on('completed', function (job, result) {
    // Job completed with output result!
    io.emit('job', { ...result, isFailed: false })
})
queue.on('failed', (job) => {
    // job has failed
    io.emit('job', { message: `Failed to send to ${job.data.chatId}`, isFailed: true })

});


export default queue