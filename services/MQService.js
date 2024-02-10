const amqp = require('amqplib/callback_api')
// const CONN_URL = 'amqp://localhost:5672' // Local conn url for rabbitMq setup using docker
const CONN_URL = `amqps://uznybqca:zZJ7jajRm2DcD_7gJ29atok6hMgGrjdM@beaver.rmq.cloudamqp.com/uznybqca`

const queue_config = require('../database').queue_config
let ch = null;

/**
 * PRODUCER, pushes msg to rabbitMq
 */

/**
 * Establish rabbitMq connection
 */
amqp.connect(CONN_URL, function (err, conn) {

    conn.createChannel(async function (err, channel) {
        ch = channel;

        //Create dynamic queues
        for(let q of queue_config) {
            if(q && q.queue_name)
                await ch.assertQueue(q.queue_name, { durable: true })
        }

        console.log('RabbitMq channel established')

    });
});

/**
 * @description Pushes msg to queue
 * @param {string} workflow_id 
 * @param {object} data 
 */
module.exports.publishToQueue = async (workflow_id, data) => {

    if(queue_config && queue_config.length > 0) {

        //Find If queue is configured for the workflow
        let queueInfo = queue_config.find(l => l.workflow_id === workflow_id)

        if(queueInfo && queueInfo.queue_name) {

            //Send msg to queue
            ch.sendToQueue(queueInfo.queue_name, Buffer.from(JSON.stringify(data)), {persistent: true});
        }
    }
    else {
        console.log('queue config not found')
    }

}

process.on('exit', (code) => {
    ch.close();
    console.log(`Closing rabbitmq channel`);
});

