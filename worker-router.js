const axios = require('axios')
const db = require('./database')
const queue_config = db.queue_config


/**
 * @description Executes N8N workflow
 * @param {object} msg_obj 
 */
module.exports.routeToWorker = async (msg_obj) => {
    try {

        if(!(msg_obj && msg_obj.workflow_id)) { // N8N workflow ID
            this.addLog('Msg object or workflow id not found',{},'error')
            return Promise.reject('Msg object or workflow id not found')
        }

        // Find if queue configuration exists for the n8n workflow in DB
        const config = queue_config.find(con => con.workflow_id === msg_obj.workflow_id)
        if(!(config && config.n8n_webhook)) {
            this.addLog('Queue config not found !',msg_obj,'error')
        }

        //Call N8N webhook
        const axios_config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: config.n8n_webhook,
            headers: {
              'Content-Type': 'application/json'
            },
            data: msg_obj['payload'] 
        }

        //Execute N8N workflow
        let result = await axios.request(axios_config)

        
        if(result.data.err) {
            return Promise.reject('Failed')
        }

        return Promise.resolve(true)
    }
    catch(err) {
        this.addLog('Failed to process msg',err,'error')
        return Promise.reject(err)
    }
}


module.exports.addLog = async (msg, params, type) => {
    try {
        // Can add logs in mongo collection
    }
    catch(err) {
        console.log(err)
    }
}