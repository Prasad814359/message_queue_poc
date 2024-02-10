const express = require('express')
const Router = express.Router()
const MQService = require('../services/MQService')

// API to push msf to queue
Router.post('/addToQueue',async(req,res,next)=>{
    let {workflow_id,payload} = req.body;
    await MQService.publishToQueue(workflow_id,req.body);
    res.statusCode = 200;
    res.data = {"message-sent":true};
    next();
})

module.exports = Router