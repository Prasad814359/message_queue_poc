const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const PORT = 3000
const mqRoute = require("./routes/MQRoute")
const worker = require('./worker')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Test endpoint
app.get('/', (req,res) => {
    res.send('Hello World')
})

//Routes
app.use("/api",mqRoute)

//Response 
app.use((req, res, next) => {
    if (!res.data) {
        return res.status(404).send({
            status: false,
            error: {
                reason: "Invalid Endpoint", 
                code: 404
            }
        });
    }

    res.status(res.statusCode || 200).send({ status: true, response: res.data });
})


app.listen(PORT, () => {
    console.log('Node running on ' + PORT)
})


module.exports = app