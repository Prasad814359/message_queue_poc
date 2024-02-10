const amqp = require('amqplib/callback_api')
// const CONN_URL = 'amqp://localhost:5672' // Local conn url for rabbitMq setup using docker
const CONN_URL = `amqps://uznybqca:zZJ7jajRm2DcD_7gJ29atok6hMgGrjdM@beaver.rmq.cloudamqp.com/uznybqca`
const WorkerRouter = require('./worker-router')

const db = require('./database')
const queue_config = db.queue_config || []
const PREFETCH_COUNT = db.PREFETCH_COUNT || 1


/**
 * CONSUMER, consumes msg from rabbitMq
 */
amqp.connect(CONN_URL, function (err, conn) {
    if(err){
        console.log('error in connection',err)
        return
    }

    conn.createChannel(async function (err, ch) {

        //Msg consume per time
        await ch.prefetch(PREFETCH_COUNT);

        //Iterating over queue config and consume msgs from respective queues
        queue_config.forEach(queue_info => {

            if(queue_info.queue_name) {

                ch.consume(queue_info.queue_name, function (msg) {

                    const parsedMsg = msg?.content?.toString()

                    const msg_obj = typeof parsedMsg === 'string' ? JSON.parse(parsedMsg) : null

                    console.log('received')

                    WorkerRouter.routeToWorker(msg_obj)
                    .then((res) => {
                        if(res) {
                            //Once the N8N execution successful, need to remove the msg from the queue, hence ack the msg.
                            // After ack next msg will get pushed to the consumer

                            //Mongo Log
                            addLog("Execution success",msg,'success')
    
                            // Acknowledge msg in order to remove from queue
                            ch.ack(msg)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        addLog('Failed to process',msg,'error')
                    })
    
                },{ noAck: false }
            );
            }
        })

    });
});


addLog = async (msg, params, type) => {
    try {
        // Can add logs in mongo collection
    }
    catch(err) {
        console.log(err)
    }
}